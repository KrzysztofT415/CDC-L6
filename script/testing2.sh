#!/bin/bash
clear

ts-node src/main.ts $1 out/res21.png 0.1 $2
echo -e "\e[34m------------------------------------------------------\e[0m"
ts-node src/main.ts $1 out/res22.png 0.01 $2
echo -e "\e[34m------------------------------------------------------\e[0m"
ts-node src/main.ts $1 out/res23.png 0.001 $2
echo -e "\e[34m------------------------------------------------------\e[0m"
ts-node src/main.ts $1 out/res24.png 0.0001 $2
echo -e "\e[34m------------------------------------------------------\e[0m"