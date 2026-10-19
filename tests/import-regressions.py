"""Isolated production-backend regressions; no AI services or operational Vaults."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
import zipfile

ROOT = Path(__file__).resolve().parent.parent
BIN = Path(os.environ.get('LIMEN_VAULT_CHECK', ROOT / 'apps/desktop/src-tauri/target/debug/vault-check'))


def call(*args, success=True):
    started = time.monotonic()
    p = subprocess.run(['/usr/bin/time', '-l', str(BIN), *map(str, args)], capture_output=True, text=True)
    if success:
        assert p.returncode == 0, str(args[:2]) + '\n' + p.stderr
    match = re.search(r'(\d+)\s+maximum resident set size', p.stderr)
    return (json.loads(p.stdout) if p.returncode == 0 else None), {
        'exit': p.returncode, 'seconds': round(time.monotonic() - started, 3),
        'rssBytes': int(match.group(1)) if match else None,
    }


def vault(path):
    call('create', path, ROOT / 'vault-template')


def catalog(path):
    return call('catalog-load', path)[0]['documents']


def text_case():
    with tempfile.TemporaryDirectory(prefix='limen-text-regression-', dir=ROOT / '.local') as td:
        v = Path(td) / 'vault'
        vault(v)
        source = v / '20_RAW_SOURCES/full.txt'
        paragraph = ('Paragrafo verificabile ' + 'dato' * 293 + '.\n\n').encode()
        with source.open('wb') as f:
            for _ in range(67000):
                f.write(paragraph)
            f.write(b'ZZTAILREGRESSIONSENTINEL\n')
        call('catalog-sync', v)
        _, extraction = call('org-prepare', v)
        doc = next(d for d in catalog(v).values() if d['fileName'] == 'full.txt')
        assert doc['extractionStatus'] == 'ready', doc['extractionError']
        assert len(doc['passages']) > 5000
        assert 'ZZTAILREGRESSIONSENTINEL' in doc['passages'][-1]['text']
        _, indexing = call('search-index', v)
        found, _ = call('search', v, json.dumps({'term': 'ZZTAILREGRESSIONSENTINEL', 'limit': 5}))
        assert len(found) == 1 and found[0]['relative_path'] == '20_RAW_SOURCES/full.txt'
        opened, reader = call('read-verified', v, doc['documentId'])
        assert 'ZZTAILREGRESSIONSENTINEL' in opened
        return {'bytes': source.stat().st_size, 'passages': len(doc['passages']), 'tailSearch': True, 'tailReader': True,
                'extraction': extraction, 'indexing': indexing, 'reader': reader}


def other_cases():
    with tempfile.TemporaryDirectory(prefix='limen-import-regression-', dir=ROOT / '.local') as td:
        b = Path(td)
        v = b / 'vault'
        vault(v)
        zpath = b / 'reserved.zip'
        with zipfile.ZipFile(zpath, 'w') as z:
            z.writestr('20_RAW_SOURCES/example.txt', 'source')
            z.writestr('00_system/VAULT_CATALOG.json', 'INVALID')
            z.writestr('.GIT/config', 'INVALID')
        receipts, _ = call('import-zip', v, zpath)
        assert all(r['status'] == 'error' for r in receipts if r['name'] in ['VAULT_CATALOG.json', 'config'])
        call('catalog-load', v)
        (v / '20_RAW_SOURCES/utf8.txt').write_bytes(b'A' * 65535 + 'é\n\nFINE'.encode())
        (v / '20_RAW_SOURCES/utf16.txt').write_bytes('Caffè attività 😀'.encode('utf-16'))
        call('org-prepare', v)
        docs = catalog(v)
        for name, expected in [('utf8.txt', 'é'), ('utf16.txt', 'Caffè attività 😀')]:
            doc = next(d for d in docs.values() if d['fileName'] == name)
            extracted = '\n'.join(p['text'] for p in doc['passages'])
            assert expected in extracted and '\ufffd' not in extracted
        # A large Office input with little extracted text must not hit the old 64 MiB payload guard.
        docx = b / 'large.docx'
        original = ROOT / 'apps/desktop/tests/fixtures/auto-knowledge/documento.docx'
        with zipfile.ZipFile(original) as src, zipfile.ZipFile(docx, 'w') as dest:
            for item in src.infolist():
                dest.writestr(item, src.read(item.filename))
            with dest.open('unused/padding.bin', 'w') as padding:
                for _ in range(1100):
                    padding.write(b'\0' * 65536)
        receipt, _ = call('import-receipt', v, docx)
        assert receipt['status'] == 'imported'
        _, office = call('org-prepare', v)
        doc = next(d for d in catalog(v).values() if d['fileName'].endswith('large.docx'))
        assert doc['extractionStatus'] == 'ready', doc['extractionError']
        assert any('LIMEN-DOCX-742' in p['text'] for p in doc['passages'])
        cancel_source = b / 'cancel.txt'
        cancel_source.write_bytes(b'x' * (1024 * 1024))
        cancel, _ = call('cancel-import-test', v, cancel_source)
        assert cancel['status'] == 'error' and 'annullata' in cancel['error']
        assert not list((v / '20_RAW_SOURCES').glob('.import-*'))
        assert not list((v / '20_RAW_SOURCES').glob('*cancel.txt'))
        return {'reservedCaseVariantsBlocked': True, 'utf8': True, 'utf16': True,
                'officeBytes': docx.stat().st_size, 'officeExtraction': office,
                'cancelledCopyCleaned': True}


if __name__ == '__main__':
    print(json.dumps({'text': text_case(), 'other': other_cases()}, indent=2))
