#!/bin/bash
set -Eeuo pipefail

umask 077

export NVM_DIR="/home/gordondm/.nvm"
if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
  # Node.js is provided by the existing Verpex NVM installation.
  source "${NVM_DIR}/nvm.sh"
fi

readonly REPOSITORY_URL="https://github.com/Naghun/Gordon-Website.git"
readonly REPOSITORY_DIR="/home/gordondm/gordon-ba-repository"
readonly FRONTEND_ROOT="/home/gordondm/gordon.ba"
readonly BACKEND_ROOT="/home/gordondm/gordon_backend_app"
readonly PYTHON_BIN="/home/gordondm/virtualenv/gordon_backend_app/3.11/bin/python"
readonly PIP_BIN="/home/gordondm/virtualenv/gordon_backend_app/3.11/bin/pip"
readonly DEPLOY_ROOT="/home/gordondm/gordon-ba-deployments"
readonly LOCK_DIR="${DEPLOY_ROOT}/deploy.lock"

requested_command="${SSH_ORIGINAL_COMMAND:-${1:-}}"

if [[ ! "${requested_command}" =~ ^deploy[[:space:]]([0-9a-f]{40})$ ]]; then
  echo "Deployment command rejected."
  exit 64
fi

commit_sha="${BASH_REMATCH[1]}"

for required_path in "${FRONTEND_ROOT}" "${BACKEND_ROOT}" "${PYTHON_BIN}" "${PIP_BIN}"; do
  if [[ ! -e "${required_path}" ]]; then
    echo "Required GordonDM path is missing: ${required_path}"
    exit 65
  fi
done

mkdir -p "${DEPLOY_ROOT}/backups"
if ! mkdir "${LOCK_DIR}" 2>/dev/null; then
  echo "Another gordon.ba deployment is already running."
  exit 75
fi
trap 'rmdir "${LOCK_DIR}" 2>/dev/null || true' EXIT

if [[ ! -d "${REPOSITORY_DIR}/.git" ]]; then
  git clone "${REPOSITORY_URL}" "${REPOSITORY_DIR}"
fi

git -C "${REPOSITORY_DIR}" fetch origin main --prune
git -C "${REPOSITORY_DIR}" cat-file -e "${commit_sha}^{commit}"
git -C "${REPOSITORY_DIR}" merge-base --is-ancestor "${commit_sha}" origin/main
git -C "${REPOSITORY_DIR}" reset --hard "${commit_sha}"

cd "${REPOSITORY_DIR}/frontend"
npm ci
npm run build

cd "${REPOSITORY_DIR}"
"${PYTHON_BIN}" backend/manage.py check

timestamp="$(date -u +%Y%m%d-%H%M%S)"
backup_dir="${DEPLOY_ROOT}/backups/${timestamp}-${commit_sha:0:8}"
mkdir -p "${backup_dir}"

tar -czf "${backup_dir}/frontend.tar.gz" \
  --exclude='./backend' \
  --exclude='./.well-known' \
  --exclude='./cgi-bin' \
  -C "${FRONTEND_ROOT}" .

tar -czf "${backup_dir}/backend-code.tar.gz" \
  --exclude='./.env' \
  --exclude='./db.sqlite3' \
  --exclude='./media' \
  --exclude='./staticfiles' \
  --exclude='./tmp' \
  -C "${BACKEND_ROOT}" .

if [[ -f "${BACKEND_ROOT}/db.sqlite3" ]]; then
  cp -p "${BACKEND_ROOT}/db.sqlite3" "${backup_dir}/db.sqlite3"
fi

rsync -a --delete \
  --exclude='.htaccess' \
  --exclude='backend/' \
  --exclude='.well-known/' \
  --exclude='cgi-bin/' \
  "${REPOSITORY_DIR}/frontend/dist/" "${FRONTEND_ROOT}/"

mkdir -p "${BACKEND_ROOT}/config" "${BACKEND_ROOT}/website" "${BACKEND_ROOT}/templates" "${BACKEND_ROOT}/media"
rsync -a --delete "${REPOSITORY_DIR}/backend/config/" "${BACKEND_ROOT}/config/"
rsync -a --delete "${REPOSITORY_DIR}/backend/website/" "${BACKEND_ROOT}/website/"
rsync -a --delete "${REPOSITORY_DIR}/backend/templates/" "${BACKEND_ROOT}/templates/"
rsync -a "${REPOSITORY_DIR}/backend/media/" "${BACKEND_ROOT}/media/"
cp -p "${REPOSITORY_DIR}/backend/manage.py" "${BACKEND_ROOT}/manage.py"
cp -p "${REPOSITORY_DIR}/backend/passenger_wsgi.py" "${BACKEND_ROOT}/passenger_wsgi.py"
cp -p "${REPOSITORY_DIR}/backend/requirements.txt" "${BACKEND_ROOT}/requirements.txt"

"${PIP_BIN}" install -r "${BACKEND_ROOT}/requirements.txt"
"${PYTHON_BIN}" "${BACKEND_ROOT}/manage.py" migrate --noinput
"${PYTHON_BIN}" "${BACKEND_ROOT}/manage.py" collectstatic --noinput

mkdir -p "${BACKEND_ROOT}/tmp"
touch "${BACKEND_ROOT}/tmp/restart.txt"

curl --fail --silent --show-error --retry 3 --retry-delay 2 "https://gordon.ba/" >/dev/null
curl --fail --silent --show-error --retry 3 --retry-delay 2 "https://gordon.ba/backend/api/blog/" >/dev/null

echo "gordon.ba deployed successfully at ${commit_sha}."
