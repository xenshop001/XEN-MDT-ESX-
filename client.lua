local ESX = exports['es_extended']:getSharedObject()
local isMdtOpen = false
local isPublicListOpen = false
local playerJob = nil

RegisterNetEvent('esx:playerLoaded', function(xPlayer)
    playerJob = xPlayer.job
end)

RegisterNetEvent('esx:setJob', function(job)
    playerJob = job
end)

CreateThread(function()
    while ESX.GetPlayerData().job == nil do
        Wait(100)
    end
    playerJob = ESX.GetPlayerData().job
end)

--
CreateThread(function()
    while true do
        Wait(0) 

        if playerJob and playerJob.name == 'police' then
            if IsControlJustReleased(0, 212) then 
                isMdtOpen = not isMdtOpen
                SetNuiFocus(isMdtOpen, isMdtOpen)
                SendNUIMessage({ action = 'toggleMDT', show = isMdtOpen })
                if isMdtOpen then
                    TriggerEvent('police_mdt:refreshList')
                end
            end
        end

        if isPublicListOpen and IsControlJustReleased(0, 177) then 
            isPublicListOpen = false
            SendNUIMessage({action = 'togglePublicList', show = false})
        end
    end
end)

RegisterCommand('wanted', function()
    if isPublicListOpen then return end
    ESX.TriggerServerCallback('police_mdt:getWantedList', function(wantedList)
        SendNUIMessage({ action = 'showPublicList', list = wantedList })
        isPublicListOpen = true
        
    end)
end, false)

RegisterNetEvent('police_mdt:refreshList', function()
    if isMdtOpen or isPublicListOpen then
        ESX.TriggerServerCallback('police_mdt:getWantedList', function(wantedList)
            SendNUIMessage({ action = 'updateList', list = wantedList })
        end)
    end
end)

RegisterNUICallback('closeMDT', function(_, cb)
    isMdtOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'toggleMDT', show = false })
    cb({})
end)

RegisterNUICallback('createRecord', function(data, cb)
    TriggerServerEvent('police_mdt:createRecord', data)
    cb({})
end)

RegisterNUICallback('updateRecordStatus', function(data, cb)
    TriggerServerEvent('police_mdt:updateRecordStatus', data.id, data.status)
    cb({})
end)
