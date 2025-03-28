yarn install

yarn workspace @shipping/shared run clean && 
yarn workspace @shipping/shared run build


yarn workspace @shipping/backend run build &&     
yarn workspace @shipping/backend run start