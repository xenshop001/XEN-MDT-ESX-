local ESX = exports['es_extended']:getSharedObject()


ESX.RegisterServerCallback('police_mdt:getWantedList', function(source, cb)
    local wantedList = MySQL.query.await('SELECT * FROM police_wanted_records WHERE status = "active" ORDER BY created_at DESC', {})
    cb(wantedList)
end)

RegisterNetEvent('police_mdt:createRecord', function(data)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer.job.name ~= 'police' then return end

    local detailsJson = json.encode({
        lastLocation = data.details.lastLocation,
        vehicle = data.details.vehicle,
        description = data.details.description
    })

    MySQL.execute([[
        INSERT INTO police_wanted_records (suspect_name, reason, officer_name, officer_identifier, mugshot_url, bail, details) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ]], {
        data.suspectName, data.reason, xPlayer.getName(), xPlayer.identifier,
        data.mugshotUrl, data.bail, detailsJson
    })

    TriggerClientEvent('police_mdt:clientNotify', source, 'MDT', 'New warrant issued.', 'inform')
    TriggerClientEvent('police_mdt:refreshList', -1)
end)


RegisterNetEvent('police_mdt:updateRecordStatus', function(recordId, newStatus)
    local xPlayer = ESX.GetPlayerFromId(source)
    if xPlayer.job.name ~= 'police' then return end

    MySQL.execute('UPDATE police_wanted_records SET status = ? WHERE id = ?', {newStatus, recordId})
    
    lib.notify({title = 'MDT', description = 'Case status updated.', type = 'success'})
    TriggerClientEvent('police_mdt:refreshList', -1)
end)