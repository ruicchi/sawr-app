#!/bin/bash
# Pinagsasama nito ang production build ng Storefront (sawrap-ecommerce)
# at ng Admin Portal (sawrap-admin-portal) sa IISANG origin/port, para
# magkapareho ang localStorage nila (kaya sila "makokonekta").
#
# PAANO GAMITIN:
#   1. Ilagay ang script na ito sa parent folder na naglalaman ng dalawang
#      project folders (sawrap-ecommerce/ at sawrap-admin-portal/).
#   2. chmod +x serve-local.sh
#   3. ./serve-local.sh
#   4. Buksan ang http://localhost:3000  -> Storefront
#      Buksan ang http://localhost:3000/admin  -> Admin Portal
#
# Kapag may binago kang code, i-re-run mo lang ulit ang script para
# mabuo ulit ang bagong build.

set -e

echo "Building storefront (sawrap-ecommerce)..."
cd sawrap-ecommerce
npm install
npm run build
cd ..

echo "Building admin portal (sawrap-admin-portal, base=/admin/)..."
cd sawrap-admin-portal
npm install
BUILD_TARGET=combined npm run build
cd ..

echo "Combining builds..."
rm -rf combined
mkdir -p combined
cp -r sawrap-ecommerce/dist/* combined/
mkdir -p combined/admin
cp -r sawrap-admin-portal/dist/* combined/admin/

echo "Serving on http://localhost:3000 ..."
npx --yes serve combined -l 3000
