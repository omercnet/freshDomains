// Saves options to chrome.storage
function save_options() {
	chrome.storage.sync.set({
		config: {
			maxCacheDays: document.getElementById('maxCacheDays').value,
			minCreatedDays: document.getElementById('minCreatedDays').value
		},
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({config: {minCreatedDays: 90, maxCacheDays: 30}, whoisCache: {}},
		function(storage) {
			console.dir(storage)
			document.getElementById('maxCacheDays').value = storage.config.maxCacheDays;
			document.getElementById('minCreatedDays').value = storage.config.minCreatedDays;
		}
	);
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
		save_options);