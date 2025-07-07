fx_version 'cerulean'
game 'gta5'

author 'Police MDT Panel'
description 'Police MDT Panel'

shared_scripts {
    '@es_extended/imports.lua',
    '@ox_lib/init.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua',
    
}

client_scripts {
    'client.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'img/ismeretlenszemely.png'
}

dependencies {
    'es_extended',
    'oxmysql'
}