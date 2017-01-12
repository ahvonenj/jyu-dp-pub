function Dropbox()
{
	this.apiurl = 'https://api.dropboxapi.com';
	this.contentapiurl = 'https://content.dropboxapi.com';
	this.code = this.getParameterByName('code') || null;

	this.token_type = null;
	this.uid = null;
	this.account_id = null;
	this.access_token = null;

	this.deferred_token = $.Deferred();

	this.client_id = '';
	this.redirect_uri = '';
	this.secret = '';

	if(typeof this.code === 'undefined' || this.code === null || !this.code)
	{
		this._authorize();
	}
	else
	{
		this._token();
	}
}

Dropbox.prototype.GetAccountInfo = function(callback)
{
	var self = this;

	$.ajax(
	{
		url: self.apiurl + '/2/users/get_account',
		type: 'post',

		data: JSON.stringify(
		{
			account_id: self.account_id
		}),

		headers:
		{
			'Authorization': 'Bearer ' + self.access_token,
			'Content-Type': 'application/json'
		},

		success: function(data, status, xhr)
		{
			console.log('Dropbox: Account info result:');
			callback(data);
		},

		error: function(xhr, status, error)
		{
			console.log('Dropbox: Token error!');
			console.log(xhr, status, error);
		}
	});
}

Dropbox.prototype.ListFolder = function(path, callback)
{
	var self = this;

	$.ajax(
	{
		url: self.apiurl + '/2/files/list_folder',
		type: 'post',

		data: JSON.stringify(
		{
			path: path,
			recursive: false,
			include_media_info: false,
			include_deleted: false,
			include_has_explicit_shared_members: false
		}),

		headers:
		{
			'Authorization': 'Bearer ' + self.access_token,
			'Content-Type': 'application/json'
		},

		success: function(data, status, xhr)
		{
			console.log('Dropbox: Folder info for ' + path + ':');
			callback(data);
		},

		error: function(xhr, status, error)
		{
			console.log('Dropbox: Token error!');
			console.log(xhr, status, error);
		}
	});
}

Dropbox.prototype.UploadFile = function(path, file, callback)
{
	var self = this;

	$.ajax(
	{
		url: self.contentapiurl + '/2/files/upload',
		type: 'post',
		contentType: 'application/octet-stream',
   		processData: false,

		data: file,

		headers:
		{
			'Authorization': 'Bearer ' + self.access_token,
			'Dropbox-API-Arg': JSON.stringify(
			{
				"path": path + file.name,
			    "mode": "add",
			    "autorename": true,
			    "mute": true
			}),
			'Content-Type': 'application/octet-stream'
		},

		success: function(data, status, xhr)
		{
			callback(data);
		},

		error: function(xhr, status, error)
		{
			console.log('Dropbox: Token error!');
			console.log(xhr, status, error);
		}
	});
}

Dropbox.prototype._authorize = function()
{
	window.location = 'https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=' + this.client_id + '&redirect_uri=' + this.redirect_uri;
}

Dropbox.prototype._token = function()
{
	var self = this;

	$.ajax(
	{
		url: self.apiurl + '/oauth2/token',
		type: 'post',

		data:
		{
			code: self.code,
			grant_type: 'authorization_code',
			client_id: self.client_id,
			client_secret: self.secret,
			redirect_uri: self.redirect_uri
		},

		success: function(data, status, xhr)
		{
			data = JSON.parse(data);

			console.log('Dropbox: Token result:');
			console.log(data, status, xhr);

			self.token_type = data.token_type;
			self.uid = data.uid;
			self.account_id = data.account_id;
			self.access_token = data.access_token;

			self.deferred_token.resolve();
		},

		error: function(xhr, status, error)
		{
			console.log('Dropbox: Token error!');
			console.log(xhr, status, error);

			window.location = self.redirect_uri;
		}
	});
}

//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
Dropbox.prototype.getParameterByName = function(name, url) 
{
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[#?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}