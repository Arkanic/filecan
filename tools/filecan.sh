#!/bin/bash

wget https://raw.githubusercontent.com/Arkanic/filecan/refs/heads/main/ci/include/update.sh
chmod +x ./update.sh
./update.sh

echo ""
echo "Done! Filecan installed."
