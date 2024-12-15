

// Call this somethings that is triggered when upload page is loaded

function init() {
    
    // Globals
    var user         = window.globaData.user;
    var focusEntity  = window.globaData.focusEntity;
    var path         = location.pathname;
    var columnTypes  = [];
    var file         = null;
    var title        = null;
    
    function genSharingWithEmail(){

	var sharingCollection  = $("#shared-user-collection");
	var addUser            = $("#add-user");
	var privacySettings    = $('input:radio[name=privacySettings]');

	// Select user defined default privacy settings
	console.log(req.user.fileSettings.defaults.visibility);
	privacySettings.filter('[value='+ req.user.fileSettings.defaults.visibility +' ]').
	    prop('checked', true );
	    
	
	// Onclick method to add new email field
	addUser.click(function(){
	    if( !$("#dataset-upload-form").valid() ) return;
		
	   
	    var userEmailSettings = {
		type: "email",
		name: "email[]",
		class: "share-with-email",
		placeholder: "Recipient email"
	    };
	    var removeEmailSettings = { 
		class: "pure-button fa fa-trash-o fa-2x remove-email"
	    };	
	    var emailContainerSettings = {	
		class: "email-list-container"
	    };
	    
	    // create list element, remove button, and input field 
	    var userEmail      = $("<input\>",  userEmailSettings);	    
	    var removeEmail    = $("<button\>", removeEmailSettings);
	    var emailContainer = $("<li\>",     emailContainerSettings);

	    // Make field required
	    userEmail.prop('required', true);

	    // Add remove button and feature
	    emailContainer.append(removeEmail);	    
	    emailContainer.append(userEmail);
	    
	    // Create `Remove` functionality
	    removeEmail.click(function(){
		emailContainer.remove();
	    });
	    
	    sharingCollection.append( emailContainer );
	});
    }
    
	function genTable(data, settings) {
		var tableConfig = {
			id: "data-display-table",
			class: "pure-table pure-table-horizontal"
		};
	
		var tableContainer = $("#table-display-container");
	
		var theadConfig = {};
		var tbodyConfig = {};
		
		var table = $("<table>", tableConfig);
		var thead = $("<thead>", theadConfig);
		var tbody = $("<tbody>", tbodyConfig);
	
		// Construct table header
		var trHead = $("<tr>");
		data[0].forEach(function(datum) {
			trHead.append($("<th>", { html: datum }));
		});
		thead.append(trHead);
	
		// Prepare settings for existing column types, if provided
		settings = settings || {};
		settings.columnTypes = settings.columnTypes || [];
	
		// Display a preview of the first 3 rows
		for (var i = 1; i < 4; i++) {
			var tr = $("<tr>");
			data[i].forEach(function(datum) {
				tr.append($("<td>", { html: datum }));
			});
			tbody.append(tr);
		}
	
		// Row for column selection using dropdowns
		var trEvalAs = $("<tr>", { class: 'eval-as' });
	
		data[0].forEach(function(datum, index) {
			var sID = 'eval-column-' + index + '-as';
			
			// Create dropdown as a select element
			var select = $("<select>", { name: "column-eval-type[]", id: sID, class: "column-dropdown" });
	
			// Check if the column is numeric
			var isColumnNumeric = isNumericColumn(data, index);
	
			// Dropdown options
			select.append($("<option>", { value: 'id', html: 'ID' }));
			select.append($("<option>", { value: 'axis', html: 'Axis', disabled: !isColumnNumeric }));
			select.append($("<option>", { value: 'meta', html: 'Meta' }));
			select.append($("<option>", { value: 'omit', html: 'Omit' }));
	
			// Set initial value from settings if available
			if (settings.columnTypes[index]) {
				select.val(settings.columnTypes[index]);
			} else {
				select.val("omit"); // Default selection to 'omit' if not specified
			}
	
			// Initialize the column type selection array
			columnTypes[index] = select.val();
	
			// Change event listener to update and log the selected value
			select.change(function() {
				columnTypes[index] = this.value;
				console.log("Updated column types:", columnTypes);
			});
	
			// Append the dropdown to the row
			trEvalAs.append($("<td>").append(select));
		});
	
		tbody.append(trEvalAs);
		table.append(thead);
		table.append(tbody);
	
		// Clear any previous table and display the new one
		tableContainer.empty();
		tableContainer.append(table);
	
		// Log the initial column types
		console.log("Initial column types:", columnTypes);
	}
	

    function genCaption(){
	
		 tinymce.init({
		 	selector: 'textarea',
		 	plugins: [
		 		'advlist autolink lists link image charmap print preview anchor',
		 		'searchreplace visualblocks code fullscreen',
		 		'insertdatetime media table contextmenu paste code'
		 	],
		 	toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
		 	height: 250
		 });
	
	//caption.trumbowyg( settings );
    }

    
    // @fileContainer and @CSV are overrides form the default data
    function populateForm(table, file, fileContainer, CSV){
	if( table.errors.length ) return console.log( table.errors );
	
	// Get the container for the new elements
	var formContainer   = $("#form-file-settings-container")
	var tableContainer  = $("#table-display-container");
	
	// Create layout with title and table
	setTitle( file.name  );
	
	// Create table
	tableContainer.append( genTable(table.data ) );
	
	// Insert caption
	setCaption( fileContainer.displaySettings.caption );
        setSharingArea( fileContainer.displaySettigns.visibility, fileContainer.sharedWith );
    }
    
    $.validator.prototype.checkForm = function () {
        //overriden in a specific page
        this.prepareForm();
        for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
            if (this.findByName(elements[i].name).length != undefined
		&& this.findByName(elements[i].name).length > 1) {
                for (var cnt = 0; cnt < this.findByName(elements[i].name).length; cnt++) {
                    this.check(this.findByName(elements[i].name)[cnt]);
                }
            } else {
                this.check(elements[i]);
            }
        }
        return this.valid();
    }
    
    // Form validation
    $("#dataset-upload-form").validate({
	ignore: [],
	rules: {
	    'email[]': { 
		required: true,
	    }
	},
	submitHandler: function(form) {
    	    var form      = $("#dataset-upload-form");
    	    var formData  = new FormData();	
	    var actionURL = form.attr('action');
	    var method    = form.attr('method').toUpperCase();
            var title     = form.find('input[name="title"]').val();
			// var description = form.find('textarea[name="description"]').val();


	    var data = {
		displaySettings: {
		    title: title,
		    caption: $('#caption'),	    
		    display: {
			columnTypes: columnTypes
		    },
		    visibility: $('input[name="privacySettings"]').val()
		},
		
		sharedWith: $('input[name^="email[]"]').map(function(){ return $(this).val();}).get()
	    };
	    
	    console.log( data );
	    // I hate to do this but I don't know how else to send objects
	    formData.append( 'revertUponArival', JSON.stringify( data ) );
	    formData.append( 'file', file);
	    
	    
	    $.ajax({
                url: actionURL,
                type: method,
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
	    }).success( function(data, textStatus){
                window.location.replace( data );
	    });
	}
    });
   
    $("#file-select").change(function (e){
	if( !e.target.files ) return null;
	
	file = e.target.files[0];
	console.log(file.name);
	
	Papa.parse( file, {
	    complete: function(parsedObj){ populateForm( parsedObj, file ); }
	});
    });
    

}

document.addEventListener("DOMContentLoaded", init);
