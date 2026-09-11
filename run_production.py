#!/usr/bin/env python3
"""
AgriCrop Production Runner & Web Browser Launcher
================================================
Starts the unified fullstack server (serving compiled React frontend + Flask REST API)
and automatically opens the application in your default web browser.

Usage:
  python run_production.py                 # Run production server & open browser
  python run_production.py --port 8080    # Custom port
  python run_production.py --no-browser   # Start server without opening browser
  python run_production.py --rebuild      # Force rebuild of frontend bundle first
  python run_production.py --test         # Quick boot & self-test check
"""

import os
import sys
import time
import argparse
import webbrowser
import subprocess
import threading

# Ensure UTF-8 output where possible
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
DIST_DIR = os.path.join(FRONTEND_DIR, 'dist')

def ensure_frontend_bundle(force_rebuild=False):
    """Build the frontend bundle if missing or rebuild requested."""
    index_html = os.path.join(DIST_DIR, 'index.html')
    if force_rebuild or not os.path.exists(index_html):
        print("[*] Building production frontend assets with Vite...")
        vite_bin = os.path.join(FRONTEND_DIR, 'node_modules', 'vite', 'bin', 'vite.js')
        if os.path.exists(vite_bin):
            cmd = ['node', vite_bin, 'build']
        else:
            cmd = ['npm', 'run', 'build']
        
        result = subprocess.run(cmd, cwd=FRONTEND_DIR, shell=(os.name == 'nt'))
        if result.returncode != 0:
            print("[!] Warning: Frontend build returned non-zero code. Attempting to proceed...")
        else:
            print("[+] Frontend bundle built successfully!")

def open_browser_delayed(url, delay_seconds=1.2):
    """Open the web browser after the server has initialized."""
    time.sleep(delay_seconds)
    print(f"\n[+] Opening AgriCrop in your default web browser: {url}\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[*] Notice: Could not automatically launch browser ({e}). Please open {url} manually.")

def main():
    parser = argparse.ArgumentParser(description="AgriCrop Production Runner")
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', 5000)), help="Port to serve on (default: 5000)")
    parser.add_argument('--host', type=str, default='0.0.0.0', help="Host interface to bind to (default: 0.0.0.0)")
    parser.add_argument('--no-browser', action='store_true', help="Do not open default browser automatically")
    parser.add_argument('--rebuild', action='store_true', help="Force rebuild of frontend assets before launching")
    parser.add_argument('--test', action='store_true', help="Self-test: start server, verify endpoints, and exit")
    args = parser.parse_args()

    # Step 1: Ensure frontend bundle exists
    ensure_frontend_bundle(force_rebuild=args.rebuild)

    # Step 2: Import Flask application
    sys.path.insert(0, BACKEND_DIR)
    from app import create_app
    app = create_app()

    local_url = f"http://localhost:{args.port}"
    network_url = f"http://{args.host}:{args.port}"

    if args.test:
        print("[*] Running self-test check on Flask application...")
        with app.test_client() as client:
            res_root = client.get('/')
            assert res_root.status_code == 200, f"Root / failed: {res_root.status_code}"
            res_health = client.get('/api/health')
            assert res_health.status_code == 200, f"Health /api/health failed: {res_health.status_code}"
            res_fields = client.get('/api/fields')
            assert res_fields.status_code == 200, f"Fields /api/fields failed: {res_fields.status_code}"
            
            # Dynamic check of assets
            assets_dir = os.path.join(DIST_DIR, 'assets')
            if os.path.exists(assets_dir) and os.listdir(assets_dir):
                first_asset = os.listdir(assets_dir)[0]
                res_asset = client.get(f'/assets/{first_asset}')
                assert res_asset.status_code == 200, f"Asset {first_asset} failed: {res_asset.status_code}"
                print(f"[+] Static asset serving verified: /assets/{first_asset} -> 200 OK")

            print("[+] Self-test passed! Root, SPA client routing, and REST API endpoints respond with 200 OK.")
            return

    # Step 3: Launch browser thread if enabled
    if not args.no_browser:
        threading.Thread(target=open_browser_delayed, args=(local_url,), daemon=True).start()

    print("=" * 65)
    print("  AgriCrop Intelligent Irrigation & Water Management Engine")
    print("  Production Server Active")
    print(f"  Local Access:     {local_url}")
    print(f"  Network Access:   {network_url}")
    print(f"  API Health:       {local_url}/api/health")
    print(f"  API Endpoints:    {local_url}/api/info")
    print("=" * 65)
    print("Press Ctrl+C to stop the server.\n")

    # Step 4: Run production WSGI server (Waitress if available, fallback to Flask)
    try:
        import waitress
        print(f"Serving with Waitress WSGI server on {args.host}:{args.port}...")
        waitress.serve(app, host=args.host, port=args.port, threads=6)
    except ImportError:
        print(f"Serving with Werkzeug on {args.host}:{args.port} (Waitress not installed)...")
        app.run(host=args.host, port=args.port, debug=False)

if __name__ == '__main__':
    main()
