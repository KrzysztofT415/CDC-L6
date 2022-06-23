#!/bin/bash
clear

ts-node src/main.ts $1 out/res1.png $2 1
echo -e "\e[34m------------------------------------------------------\e[0m"
ts-node src/main.ts $1 out/res2.png $2 2
echo -e "\e[34m------------------------------------------------------\e[0m"
ts-node src/main.ts $1 out/res3.png $2 3
echo -e "\e[34m------------------------------------------------------\e[0m"
ts-node src/main.ts $1 out/res4.png $2 4
echo -e "\e[34m------------------------------------------------------\e[0m"