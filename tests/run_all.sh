all="testOP testVol testChat_v_o testAudio_v_o"

for t in $all
do
  echo $t
  r=`node $t`
  if [ $r != 'OK']
  then
    echo $r;
  fi
done