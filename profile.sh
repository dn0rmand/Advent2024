deno --v8-flags=--prof --allow-all $1
ISOLATE=`ls isolate*.log`
echo ${ISOLATE}
node --prof-process ${ISOLATE} > profiler.txt
rm ${ISOLATE}
code profiler.txt
sleep 5
rm profiler.txt