"""Convert only newly received catalog photos; never connect to remote services.

The reviewed image inventory supplies proposed models, not permission to rename
products. Ambiguous models and conflicting product identities stay on hold.
"""

import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import shutil
import zipfile

from PIL import Image, ImageDraw, ImageOps


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def model_key(value):
    return re.sub(r"[^A-Z0-9]", "", value.upper())


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def clean_photo_label(value):
    return re.sub(r"\.\s*(?:portada|\d+)(?:\.\d+)*$", "", value, flags=re.I)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--review", type=Path, required=True)
    parser.add_argument("--previous-manifest", type=Path, required=True)
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--batch", required=True, help="YYYYMMDD")
    args = parser.parse_args()
    if not re.fullmatch(r"\d{8}", args.batch):
        raise ValueError("Batch must have eight digits")
    if args.output.exists():
        raise ValueError("Output already exists; choose a new directory to preserve prior results")

    review = json.loads(args.review.read_text())
    previous = json.loads(args.previous_manifest.read_text())
    catalog = json.loads(args.catalog.read_text())
    existing = defaultdict(list)
    for row in catalog:
        existing[model_key(row["model"])].append(row)
    conflicts = {model_key(row["model"]) for row in previous["conflicts"]}

    originals = {}
    for row in review["imageDetails"]:
        relative = Path(row["path"])
        if relative.is_absolute() or ".." in relative.parts:
            raise ValueError("Image source must be relative to the delivery directory")
        source = args.source / relative
        originals[source] = digest(source)
        if originals[source] != row["sha256"]:
            raise ValueError(f"Source changed after review: {relative}")
    # Every new file must be covered by the reviewed inventory.
    received = {p for p in args.source.rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}}
    if received != set(originals):
        raise ValueError("Delivery image inventory changed; review it again first")

    groups = defaultdict(list)
    for row in review["imageDetails"]:
        if row["new"]:
            group = row["matches"][0] if len(row["matches"]) == 1 else clean_photo_label(Path(row["path"]).stem)
            groups[group].append(row)

    args.output.mkdir(parents=True)
    entries, previews = [], []
    for proposed_model, rows in sorted(groups.items()):
        rows.sort(key=lambda row: ("portada" not in row["path"].lower(), row["path"]))
        multiple_covers = sum("portada" in row["path"].lower() for row in rows) > 1
        for position, row in enumerate(rows):
            source = args.source / row["path"]
            candidates = row["matches"]
            candidate = candidates[0] if len(candidates) == 1 else None
            matches = existing.get(model_key(candidate), []) if candidate else []
            reasons = []
            if not candidate:
                reasons.append("El nombre de archivo/carpeta no coincide con un modelo del Excel")
            elif model_key(clean_photo_label(source.stem)) != model_key(candidate):
                reasons.append("El archivo y la carpeta difieren en el código del modelo")
            if candidate and model_key(candidate) in conflicts:
                reasons.append("Modelo repetido pendiente de consolidación aprobada")
            if candidate and len(matches) != 1:
                reasons.append("El modelo no tiene una coincidencia única en el catálogo anterior")
            if candidate == "55A65NV":
                reasons.append("La imagen muestra 65 pulgadas y el nombre corresponde a 55 pulgadas")
            if multiple_covers:
                reasons.append("Hay más de una portada declarada")
            on_hold = bool(reasons)
            bucket = "pendientes" if on_hold else "listas"
            suffix = "portada" if position == 0 else f"{position:02d}"
            filename = f"{slug(proposed_model)}-{suffix}.webp"
            relative = Path("webp") / bucket / slug(proposed_model) / filename
            target = args.output / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image)
                image.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
                # Flatten actual transparency onto white, without changing opaque backgrounds.
                if "A" in image.getbands() or "transparency" in image.info:
                    rgba = image.convert("RGBA")
                    prepared = Image.new("RGB", image.size, "white")
                    prepared.paste(rgba, mask=rgba.getchannel("A"))
                else:
                    prepared = image.convert("RGB")
                prepared.save(target, "WEBP", quality=82, method=6)
                size = prepared.size
            with Image.open(target) as check:
                check.load()
                if check.format != "WEBP" or check.size != size:
                    raise ValueError(f"Invalid converted image: {target}")
                thumbnail = check.copy()
                thumbnail.thumbnail((230, 170))
                previews.append((thumbnail, proposed_model, bucket))
            sha = digest(target)
            upload_name = f"{args.batch}-{slug(proposed_model)}-{suffix}-{sha[:12]}.webp"
            # Only uniquely matched photos are placed in the ready-to-upload directory.
            if not on_hold:
                upload = args.output / "upload-listas" / upload_name
                upload.parent.mkdir(exist_ok=True)
                shutil.copy2(target, upload)
            entries.append(dict(source=row["path"], sourceSha256=row["sha256"],
                                model=candidate, label=proposed_model, path=relative.as_posix(),
                                sha256=sha, originalBytes=row["bytes"], webpBytes=target.stat().st_size,
                                width=size[0], height=size[1], status="hold" if on_hold else "ready-for-live-match",
                                reasons=reasons, suggestions=row.get("suggestions", []),
                                existingSourceRef=matches[0]["id"] if len(matches)==1 else None,
                                existingSlug=matches[0]["slug"] if len(matches)==1 else None,
                                explicitCover="portada" in source.stem.lower(), proposedOrder=position,
                                storagePath=f"catalog-products/{upload_name}" if not on_hold else None,
                                qualityWarning="Resolución original pequeña; no ampliada" if max(size)<500 else None))

    ready = [r for r in entries if r["status"] == "ready-for-live-match"]
    summary = dict(batch=args.batch, totalReceived=len(received), previouslyPrepared=len(received)-len(entries),
                   converted=len(entries), readyPhotos=len(ready), readyModels=len({r["model"] for r in ready}),
                   heldPhotos=len(entries)-len(ready), originalBytes=sum(r["originalBytes"] for r in entries),
                   webpBytes=sum(r["webpBytes"] for r in entries),
                   lowResolutionPhotos=sum(bool(r["qualityWarning"]) for r in entries))
    summary["reductionPercent"] = round(100*(1-summary["webpBytes"]/summary["originalBytes"]), 1)
    manifest = dict(summary=summary, source=str(args.source), reviewSha256=digest(args.review),
                    previousManifestSha256=digest(args.previous_manifest), images=entries,
                    remoteStatus="not-uploaded-not-applied", quality=82, maximumDimension=2000,
                    existingGalleries="Preserve existing images; do not overwrite without a live match",
                    policies="Client requested retaining the original text; no policy edits or publication in this batch")
    (args.output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n")
    shutil.copy2(args.review, args.output / "source-review.json")
    with zipfile.ZipFile(args.output / "imagenes-nuevas-webp.zip", "w", zipfile.ZIP_STORED) as archive:
        for row in entries:
            archive.write(args.output / row["path"], row["path"])

    columns, width, height = 5, 250, 215
    contact = Image.new("RGB", (columns*width, ((len(previews)+columns-1)//columns)*height), "white")
    draw = ImageDraw.Draw(contact)
    for i, (thumb, label, bucket) in enumerate(previews):
        x, y = (i%columns)*width, (i//columns)*height
        contact.paste(thumb, (x+(width-thumb.width)//2, y+(170-thumb.height)//2))
        draw.text((x+8,y+178), label, fill="black")
        draw.text((x+8,y+196), bucket, fill="black")
    contact.save(args.output / "contact-sheet.jpg", quality=90)
    review_text = ["# Imágenes pendientes de asignación", "", "Convertidas a WebP, sin asignar a productos.", ""]
    for row in entries:
        if row["status"] == "hold":
            review_text += [f"## {row['source']}", "", *[f"- {reason}." for reason in row["reasons"]], ""]
    (args.output / "pendientes.md").write_text("\n".join(review_text))
    for source, before in originals.items():
        if digest(source) != before:
            raise ValueError(f"An original file changed: {source}")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
