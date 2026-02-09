#!/usr/bin/env python3
"""
Deploy Todo App to Hugging Face Spaces.
"""

import os
import shutil
from pathlib import Path

from huggingface_hub import HfApi, create_repo, upload_folder

# Configuration
BACKEND_SPACE_NAME = "todo-backend"
FRONTEND_SPACE_NAME = "todo-frontend"


def main():
    api = HfApi()
    user_info = api.whoami()
    username = user_info["name"]
    print(f"Logged in as: {username}")

    project_root = Path(__file__).parent.parent

    # Create Backend Space
    print("\n" + "=" * 50)
    print("Creating Backend Space...")
    print("=" * 50)

    backend_repo_id = f"{username}/{BACKEND_SPACE_NAME}"

    try:
        create_repo(
            repo_id=backend_repo_id,
            repo_type="space",
            space_sdk="docker",
            exist_ok=True,
            private=False,
        )
        print(f"Created space: {backend_repo_id}")
    except Exception as e:
        print(f"Note: {e}")

    # Prepare backend files for upload
    backend_upload_dir = project_root / "temp_backend_upload"
    if backend_upload_dir.exists():
        shutil.rmtree(backend_upload_dir)
    backend_upload_dir.mkdir()

    # Copy backend files
    shutil.copy(
        project_root / "huggingface" / "backend" / "README.md",
        backend_upload_dir / "README.md",
    )
    shutil.copy(
        project_root / "huggingface" / "backend" / "Dockerfile",
        backend_upload_dir / "Dockerfile",
    )
    shutil.copy(
        project_root / "backend" / "requirements.txt",
        backend_upload_dir / "requirements.txt",
    )
    shutil.copytree(project_root / "backend" / "app", backend_upload_dir / "app")

    # Upload backend
    print("Uploading backend files...")
    upload_folder(
        folder_path=str(backend_upload_dir),
        repo_id=backend_repo_id,
        repo_type="space",
    )
    print(f"Backend uploaded: https://huggingface.co/spaces/{backend_repo_id}")

    # Cleanup
    shutil.rmtree(backend_upload_dir)

    # Create Frontend Space
    print("\n" + "=" * 50)
    print("Creating Frontend Space...")
    print("=" * 50)

    frontend_repo_id = f"{username}/{FRONTEND_SPACE_NAME}"

    try:
        create_repo(
            repo_id=frontend_repo_id,
            repo_type="space",
            space_sdk="docker",
            exist_ok=True,
            private=False,
        )
        print(f"Created space: {frontend_repo_id}")
    except Exception as e:
        print(f"Note: {e}")

    # Prepare frontend files for upload
    frontend_upload_dir = project_root / "temp_frontend_upload"
    if frontend_upload_dir.exists():
        shutil.rmtree(frontend_upload_dir)
    frontend_upload_dir.mkdir()

    # Copy frontend files
    shutil.copy(
        project_root / "huggingface" / "frontend" / "README.md",
        frontend_upload_dir / "README.md",
    )
    shutil.copy(
        project_root / "huggingface" / "frontend" / "Dockerfile",
        frontend_upload_dir / "Dockerfile",
    )

    # Copy all frontend source files
    frontend_src = project_root / "frontend"
    for item in [
        "package.json",
        "package-lock.json",
        "next.config.js",
        "tailwind.config.ts",
        "postcss.config.js",
        "tsconfig.json",
        "next-env.d.ts",
    ]:
        src_file = frontend_src / item
        if src_file.exists():
            shutil.copy(src_file, frontend_upload_dir / item)

    # Copy directories
    for dir_name in ["app", "components", "lib", "types", "public", "scripts"]:
        src_dir = frontend_src / dir_name
        if src_dir.exists():
            shutil.copytree(src_dir, frontend_upload_dir / dir_name)

    # Upload frontend
    print("Uploading frontend files...")
    upload_folder(
        folder_path=str(frontend_upload_dir),
        repo_id=frontend_repo_id,
        repo_type="space",
    )
    print(f"Frontend uploaded: https://huggingface.co/spaces/{frontend_repo_id}")

    # Cleanup
    shutil.rmtree(frontend_upload_dir)

    # Print summary
    print("\n" + "=" * 50)
    print("DEPLOYMENT COMPLETE!")
    print("=" * 50)
    print(f"\nBackend: https://huggingface.co/spaces/{backend_repo_id}")
    print(f"Frontend: https://huggingface.co/spaces/{frontend_repo_id}")
    print(f"\nAPI Docs: https://{username}-{BACKEND_SPACE_NAME}.hf.space/docs")


if __name__ == "__main__":
    main()
