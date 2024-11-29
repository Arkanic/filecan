#!/bin/bash

echo "Updating filecan..."
wget https://github.com/Arkanic/filecan/releases/latest/download/filecan.zip
echo "Extracting..."
unzip -o filecan.zip
rm filecan.zip
echo "Done!"