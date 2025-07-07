const mdtContainer = document.getElementById('mdt-container');
const wantedListDiv = document.getElementById('wanted-list');
const publicListContainer = document.getElementById('public-wanted-container');
const publicListDiv = document.getElementById('public-list');
const createForm = document.getElementById('create-wanted-form');

function renderWantedList(list) {
    wantedListDiv.innerHTML = '';
    if (!list || list.length === 0) {
        wantedListDiv.innerHTML = '<p style="text-align: center; color: #9ca3af;">No active warrants.</p>';
        return;
    }
    list.forEach(record => {
        const date = new Date(record.created_at).toLocaleString('en-US');
        let details = {};
        try { details = JSON.parse(record.details) || {}; } catch (e) {}

        const recordElem = document.createElement('div');
        recordElem.className = 'wanted-record';
        recordElem.innerHTML = `
            <div class="record-header">
                <h3>${record.suspect_name}</h3>
                <button class="status-btn" data-id="${record.id}" data-status="inactive">Close Case</button>
            </div>
            <div class="record-body">
                <img src="${record.mugshot_url || '/img/ismeretlenszemely.png'}" alt="Mugshot" class="mugshot">
                <dl class="record-details">
                    <dt>Issuing Officer:</dt><dd>${record.officer_name}</dd>
                    <dt>Date Issued:</dt><dd>${date}</dd>
                    <dt>Bail:</dt><dd>${record.bail ? '$' + record.bail.toLocaleString('en-US') : 'Not specified'}</dd>
                    <dt>Known Vehicle:</dt><dd>${details.vehicle || 'Not specified'}</dd>
                    <dt>Last Location:</dt><dd>${details.lastLocation || 'Not specified'}</dd>
                    <dt>Description:</dt><dd>${details.description || 'Not specified'}</dd>
                    <dt>Reason:</dt><dd class="reason">${record.reason}</dd>
                </dl>
            </div>
        `;
        wantedListDiv.appendChild(recordElem);
    });
}


function renderPublicList(list) {
    publicListDiv.innerHTML = '';
    if (!list || list.length === 0) {
        publicListDiv.innerHTML = '<p style="text-align: center;">Currently no active warrants.</p>';
        return;
    }
    list.forEach(record => {
        const date = new Date(record.created_at).toLocaleString('en-US');
        let details = {};
        try { details = JSON.parse(record.details) || {}; } catch (e) {}
        
        const recordElem = document.createElement('div');
        recordElem.className = 'public-record'; 
        recordElem.innerHTML = `
            <img src="${record.mugshot_url || '/img/ismeretlenszemely.png'}" alt="Mugshot" class="mugshot">
            <div class="public-record-info">
                <h3>${record.suspect_name}</h3>
                <dl class="record-details public-details">
                    <dt>Reason for Warrant:</dt><dd class="reason">${record.reason}</dd>
                    <dt>Date Issued:</dt><dd>${date}</dd>
                    <dt>Bail:</dt><dd>${record.bail ? '$' + record.bail.toLocaleString('en-US') : 'None'}</dd>
                    <dt>Known Vehicle:</dt><dd>${details.vehicle || 'None'}</dd>
                    <dt>Last Location:</dt><dd>${details.lastLocation || 'None'}</dd>
                </dl>
            </div>
        `;
        publicListDiv.appendChild(recordElem);
    });
}

window.addEventListener('message', (event) => {
    const { action, show, list } = event.data;
    switch(action) {
        case 'toggleMDT': mdtContainer.classList.toggle('hidden', !show); break;
        case 'updateList': renderWantedList(list); if (!publicListContainer.classList.contains('hidden')) { renderPublicList(list); } break;
        case 'showPublicList': renderPublicList(list); publicListContainer.classList.remove('hidden'); break;
        case 'togglePublicList': publicListContainer.classList.toggle('hidden', !show); break;
    }
});

document.getElementById('close-mdt-btn').addEventListener('click', () => { fetch(`https://xen_mdt/closeMDT`, { method: 'POST' }); });

createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const suspectName = document.getElementById('suspect-name').value;
    const reason = document.getElementById('wanted-reason').value;
    if (suspectName && reason) {
        fetch(`https://xen_mdt/createRecord`, {
            method: 'POST',
            body: JSON.stringify({
                suspectName, reason,
                mugshotUrl: document.getElementById('mugshot-url').value,
                bail: document.getElementById('bail-amount').value || null,
                details: {
                    lastLocation: document.getElementById('last-location').value,
                    vehicle: document.getElementById('vehicle').value,
                    description: document.getElementById('description').value
                }
            })
        });
        createForm.reset();
    }
});

wantedListDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('status-btn')) {
        const recordId = e.target.dataset.id;
        const newStatus = e.target.dataset.status;
        fetch(`https://xen_mdt/updateRecordStatus`, {
            method: 'POST',
            body: JSON.stringify({ id: recordId, status: newStatus })
        });
    }
});
