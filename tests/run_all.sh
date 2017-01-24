DIR=`dirname $0`
all="testOP testVol testChat_v_o testAudio_v_o testVideo_v_o"

RESULT=0

for t in $all
do
  echo -n "$DIR/$t: "
  r=`node $DIR/$t`
  echo $r
  if [ $r != 'OK' ]
  then
    echo "------------------------"
    RESULT=1
  fi
done