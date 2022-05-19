for file in img/*.svg; do
	filename=$(basename "$file")
	extension="${filename##*.}"
	filename="${filename%.*}"
	echo ".app-$filename {" 
	echo "	background-image: url('./$file');"
	echo "}"
done