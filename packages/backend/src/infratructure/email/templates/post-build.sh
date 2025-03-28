source_extension=mjml
build_extension=hbs
templates=("ilunch" )
for template in ${templates[*]}; do
  echo "Building $template..."
  yarn mjml "$(pwd)/$template.$source_extension" -o "$(pwd)/$template.$build_extension"
done
