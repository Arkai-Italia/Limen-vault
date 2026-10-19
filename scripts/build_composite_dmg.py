import os
import sys
import hashlib
import pycdlib

def main():
    stage_dir = r"E:\BNXT_VAULT_WORKING_CORPUS\DMG_STAGE"
    out_dmg = r"E:\Projects\vault_memai_obsi\USER INSTALL\LIMEN-Vault-BNXT-Edition.dmg"
    os.makedirs(os.path.dirname(out_dmg), exist_ok=True)

    print("Inizializzazione immagine disco UDF per macOS...")
    iso = pycdlib.PyCdlib()
    iso.new(interchange_level=3, udf="2.60", vol_ident="LIMEN Vault BNXT")

    # Mappatura gerarchica delle directory
    dir_map = {} # rel_dir -> iso_dir_path
    dir_counter = 0

    all_dirs = []
    for root, dirs, files in os.walk(stage_dir):
        rel_root = os.path.relpath(root, stage_dir).replace("\\", "/")
        if rel_root != ".":
            all_dirs.append(rel_root)

    # Ordina per profondità così i padri vengono creati prima dei figli
    all_dirs.sort(key=lambda d: d.count("/"))

    for rel_d in all_dirs:
        dir_counter += 1
        parts = rel_d.split("/")
        if len(parts) == 1:
            parent_iso = ""
        else:
            parent_rel = "/".join(parts[:-1])
            parent_iso = dir_map[parent_rel]
        iso_dir = f"{parent_iso}/D{dir_counter:05d}"
        dir_map[rel_d] = iso_dir
        udf_dir = "/" + rel_d
        iso.add_directory(iso_dir, udf_path=udf_dir)

    print(f"Create {len(dir_map)} cartelle nel filesystem UDF.")

    file_counter = 0
    total_bytes = 0

    for root, dirs, files in os.walk(stage_dir):
        rel_root = os.path.relpath(root, stage_dir).replace("\\", "/")
        parent_iso = dir_map.get(rel_root, "")

        for f in files:
            file_counter += 1
            full_path = os.path.join(root, f)
            rel_file = os.path.relpath(full_path, stage_dir).replace("\\", "/")
            udf_file_path = "/" + rel_file
            iso_file_path = f"{parent_iso}/F{file_counter:07d}.DAT;1"

            file_size = os.path.getsize(full_path)
            total_bytes += file_size

            iso.add_file(full_path, iso_path=iso_file_path, udf_path=udf_file_path)

            if file_counter % 1000 == 0:
                print(f"Aggiunti {file_counter} file...")

    print(f"Totale {file_counter} file mappati ({total_bytes / (1024*1024):.2f} MB).")
    print(f"Scrittura immagine DMG in corso: {out_dmg}...")
    iso.write(out_dmg)
    iso.close()

    dmg_size = os.path.getsize(out_dmg)
    print(f"DMG scritto con successo! Dimensione finale: {dmg_size} byte ({dmg_size / (1024*1024):.2f} MB)")

    # Calcolo SHA-256
    print("Calcolo SHA-256 del file DMG generato...")
    h = hashlib.sha256()
    with open(out_dmg, "rb") as f:
        while chunk := f.read(4 * 1024 * 1024):
            h.update(chunk)
    sha256 = h.hexdigest()
    print(f"SHA-256: {sha256}")

    # Salva il file di checksum
    sha_file = out_dmg + ".sha256.txt"
    with open(sha_file, "w", encoding="utf-8") as sf:
        sf.write(f"{sha256} *{os.path.basename(out_dmg)}\n")
    print(f"Checksum salvato in {sha_file}")

if __name__ == "__main__":
    main()
