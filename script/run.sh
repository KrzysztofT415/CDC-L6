#!/bin/bash
input=""

for f in "$@"
do
    input+=$f
    input+=" "
done
input+=" f"

echo -e $input | npx ts-node src/main.ts