#!/bin/bash

echo "Updating filecan..."
wget https://github.com/Arkanic/filecan/releases/latest/download/filecan.zip
echo "Extracting..."
# make sure config isn't overwritten
mv config.yml cfgtemp2501.yml
unzip -o filecan.zip
rm filecan.zip
mv cfgtemp2501.yml config.yml
./install.sh
echo "Done!"
