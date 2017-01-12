var dropbox;

$(document).ready(function()
{
	dropbox = new Dropbox();

	$.when(dropbox.deferred_token).then(function()
	{
		dropbox.GetAccountInfo(function(data)
		{
			var toappend = '<table id = "user_info_table">';

			toappend += '<tr><td>Name</td><td>' + data.name.display_name + '</td></tr>';
			toappend += '<tr><td>Initials</td><td>' + data.name.abbreviated_name + '</td></tr>';
			toappend += '<tr><td>Email</td><td>' + data.email + '</td></tr>';
			toappend += '<tr><td>Email verified</td><td>' + data.email_verified + '</td></tr>';
			toappend += '<tr><td>Is teammate</td><td>' + data.is_teammate + '</td></tr>';
			toappend += '<tr><td>Account disabled</td><td>' + data.disabled + '</td></tr>';
			toappend += '<tr><td>Account id</td><td>' + data.account_id + '</td></tr>';

			toappend += '</table>';

			$('#user_info_content').hide().empty().append(toappend).fadeIn('fast');
		});

		dropbox.ListFolder('', function(data)
		{
			var toappend = '<p>Listing folder /</p>';

			toappend += '<ul id = "filelist">';

			for(var i = 0; i < data.entries.length; i++)
			{
				var file = data.entries[i];

				toappend += '<li>';

				toappend += '<b>' + file.name + '</b> (' + file.size + 'kb), modified: ' + file.server_modified + ', ID: ' + file.id;

				toappend += '</li>';		
			}

			toappend += '</ul>';

			$('#folder_listing_content').hide().empty().append(toappend).fadeIn('fast');
		});
	});
});

function uploadFile()
{
	var file = $('#file_to_upload')[0].files[0];

	if(typeof file === 'undefined')
	{
		alert('Please select a file to upload!');
	}
	else
	{
		dropbox.UploadFile('/', file, function(data)
		{
			console.log('Dropbox: File upload info:');
			console.log(data);

			$('#file_to_upload').wrap('<form>').closest('form').get(0).reset();
  			$('#file_to_upload').unwrap();

  			dropbox.ListFolder('', function(data)
			{
				var toappend = '<p>Listing folder /</p>';

				toappend += '<ul id = "filelist">';

				for(var i = 0; i < data.entries.length; i++)
				{
					var file = data.entries[i];

					toappend += '<li>';

					toappend += '<b>' + file.name + '</b> (' + file.size + 'kb), modified: ' + file.server_modified + ', ID: ' + file.id;

					toappend += '</li>';		
				}

				toappend += '</ul>';

				$('#folder_listing_content').hide().empty().append(toappend).fadeIn('fast');
			});
		})
	}
}