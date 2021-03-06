/**
 * This file is part of an ADDON for use with Black Cat CMS Core.
 * This ADDON is released under the GNU GPL.
 * Additional license terms can be seen in the info.php of this module.
 *
 * @module			blacknews
 * @version			see info.php of this module
 * @author			Matthias Glienke, creativecat
 * @copyright		2013, Black Cat Development
 * @link			http://blackcat-cms.org
 * @license			http://www.gnu.org/licenses/gpl.html
 *
 */


$(document).ready(function(){
	$('.blacknews_options').slideUp(0);
	$('.blacknews_options_button').click( function(e)
	{
		e.preventDefault();
		var current	= $(this),
			content	= current.next('div');
		if ( current.hasClass('active') )
		{
			content.slideUp(300, function() {
				content.removeClass('active')
			});
			current.removeClass('active');
		}
		else {
			content.addClass('active').slideDown(300);
			current.addClass('active');
		}
	});

	var short_on	= $('.blacknews_short_check');
	if ( short_on.prop('checked') ){
		$('.blacknews_short_on').slideDown(0);
		$('.blacknews_short_off').slideUp(0);
	} else {
		$('.blacknews_short_on').slideUp(0);
		$('.blacknews_short_off').slideDown(0);
	}
	short_on.change( function(e)
	{
		e.preventDefault();
		if ( short_on.prop('checked') ){
		    $('.blacknews_short_on').slideDown(200);
		    $('.blacknews_short_off').slideUp(200);
		} else {
		    $('.blacknews_short_on').slideUp(200);
		    $('.blacknews_short_off').slideDown(200);
		}
	});

	$('.show_more_options').click( function(e)
	{
		e.preventDefault();
		var current	= $(this);
		
		current.next('div').slideToggle(200);
	}).click();

	$('.blacknews_add').click( function(e)
	{
		e.preventDefault();
		var current	= $(this).closest('.blacknews_all').find('form'),
			url		= CAT_URL + '/modules/blacknews/ajax/add_entry.php',
			dates		= {
				'page_id':		current.find('input[name=page_id]').val(),
				'section_id':	current.find('input[name=section_id]').val(),
				'_cat_ajax':	1
			};
		$.ajax(
		{
			type:		'POST',
			context:	current,
			url:		url,
			dataType:	'JSON',
			data:		dates,
			cache:		false,
			beforeSend:	function( data )
			{
				data.process	= set_activity( 'Adding new entry' );
			},
			success:	function( data, textStatus, jqXHR  )
			{
				var current			= $(this),
					current_ul		= current.closest('.blacknews_all').find('.blacknews_entries');
				if ( data.success === true )
				{
					current_ul.children('li').not(current).removeClass('fc_active');
					current_ul.prepend('<li class="bn_icon-feed drafted"><input type="hidden" name="news_id" value="' + data.values.news_id + '" /> ' + data.values.title + '</li>');


					return_success( jqXHR.process , data.message);

					var	blacknews_long ='blacknews_long_' +  data.values.section_id,
						blacknews_short ='blacknews_short_' +  data.values.section_id;


					current.find('input[name=news_id]').val( data.values.news_id );
					current.find('input[name=title]').val( data.values.title );
					current.find('input[name=subtitle]').val( data.values.subtitle );
					current.find('input[name=category]').val( data.values.category );
					current.find('.info_created_by').text( data.values.user );
					current.find('.info_published').text( data.values.time );
					current.find('.info_last_update').text( data.values.time );
					current.find('.blacknews_short_check').prop( 'checked', data.values.auto_generate ).change();
					current.find('input[name=auto_generate_size]').val( data.values.auto_generate_size );

					CKEDITOR.instances[blacknews_long].setData( data.values.content );
					CKEDITOR.instances[blacknews_short].setData( data.values.content_short );

					if( data.values.active ){
						current.find('button.bn_icon-feed').removeClass('drafted').addClass('published');
					}
					else {
						current.find('button.bn_icon-feed').removeClass('published').addClass('drafted');
					}
				}
				else {
					return_error( jqXHR.process , data.message);
				}
			}
		});
	});

	$('.blacknews_entries').on( 'click', 'li', function(e)
	{
		e.preventDefault();
		var current			= $(this),
			current_form	= current.closest('.blacknews_container').find('form'),
			url		= CAT_URL + '/modules/blacknews/ajax/get_info.php',
			dates		= {
				'news_id':		current.children('input').val(),
				'page_id':		current_form.find('input[name=page_id]').val(),
				'section_id':	current_form.find('input[name=section_id]').val(),
				'_cat_ajax':	1
			};
		$.ajax(
		{
			type:		'POST',
			context:	current,
			url:		url,
			dataType:	'JSON',
			data:		dates,
			cache:		false,
			beforeSend:	function( data )
			{
				data.process	= set_activity( 'Loading entry' );
			},
			success:	function( data, textStatus, jqXHR  )
			{
				var current			= $(this).closest('.blacknews_container').find('form'),
					current_ul		= current.closest('.blacknews_entries');

				current_ul.children('li').not(current).removeClass('fc_active');
				current.addClass('fc_active');
				if ( data.success === true )
				{
					return_success( jqXHR.process , data.message);

					var	blacknews_long ='blacknews_long_' +  data.values.section_id,
						blacknews_short ='blacknews_short_' +  data.values.section_id;
					current.find('input[name=news_id]').val( data.values.news_id );
					current.find('input[name=title]').val( data.values.title );
					current.find('input[name=subtitle]').val( data.values.subtitle );
					current.find('input[name=category]').val( data.values.category );
					current.find('.info_created_by').text( data.values.created_by );
					current.find('.info_published').text( data.values.created );
					current.find('.info_last_update').text( data.values.updated );
					current.find('.blacknews_short_check').prop( 'checked', data.values.auto_generate ).change();
					current.find('input[name=auto_generate_size]').val( data.values.auto_generate_size );
					if ( data.values.image )
						$('.blacknews_show_image').html('<img src="' + data.values.image + '" alt="Preview" />');
					else $('.blacknews_show_image').html('<span class="small">' + cattranslate('There was no picture added.') + '</span>');

					CKEDITOR.instances[blacknews_long].setData( data.values.content );
					CKEDITOR.instances[blacknews_short].setData( data.values.content_short );

					if( data.values.active ){
						current.find('button.bn_icon-feed').removeClass('drafted').addClass('published');
					}
					else {
						current.find('button.bn_icon-feed').removeClass('published').addClass('drafted');
					}
				}
				else {
					return_error( jqXHR.process , data.message);
				}
			}
		});
	}).find('li:first').click();

	if ( $('.blacknews_entries li').size() == 0 )
	{
		$('.blacknews_add').click();
	}

	dialog_form(
		$('.blacknews_form'),
		false,
		function( data, textStatus, jqXHR )
		{
			var current			= $(this);
			current.find('input:file').val('');
			current.find('.info_last_update').text( data.time );
			current.closest('.blacknews_all')
				.find('input[name=news_id_' + data.news_id + ']').next('span').text( data.title );
			if ( data.image )
				$('.blacknews_show_image').html('<img src="' + data.image + '" alt="Preview" />');
		},
		'JSON'
	);

	$('button.bn_icon-feed').click( function(e)
	{
		e.preventDefault();

		var current		= $(this),
			form		= current.closest('form'),
			page_id		= form.find('input[name=page_id]').val(),
			section_id	= form.find('input[name=section_id]').val(),
			news_id		= form.find('input[name=news_id]').val(),
			url			= CAT_URL + '/modules/blacknews/ajax/publish.php',
			dates		= {
				'section_id':			section_id,
				'page_id':				page_id,
				'news_id':				news_id,
				'publish':				current.hasClass('published') ? 0 : 1,
				'_cat_ajax':			1
			};
		$.ajax(
		{
			type:		'POST',
			context:	current,
			url:		url,
			dataType:	'JSON',
			data:		dates,
			cache:		false,
			beforeSend:	function( data )
			{
				data.process	= set_activity( 'Publishing entry' );
			},
			success:	function( data, textStatus, jqXHR  )
			{
				var current			= $(this).closest('form').submit(),
					cur_parent		= current.closest('.blacknews_container');
				if ( data.success === true )
				{
					if ( data.active ) {
						current.find('button.bn_icon-feed').removeClass('drafted').addClass('published');
						cur_parent.find('input[value=' + data.news_id + ']').closest('.bn_icon-feed')
							.removeClass('drafted').addClass('published');
					}
					else {
						current.find('button.bn_icon-feed').removeClass('published').addClass('drafted');
						cur_parent.find('input[value=' + data.news_id + ']').closest('.bn_icon-feed')
							.removeClass('published').addClass('drafted');
					}
					return_success( jqXHR.process , data.message);
				}
				else {
					return_error( jqXHR.process , data.message);
				}
			}
		});
	});

	$('.blacknews_delete ').click( function(e)
	{
		e.preventDefault();

		var current		= $(this).closest('form'),
			dates		= {
				'section_id':			current.find('input[name=section_id]').val(),
				'page_id':				current.find('input[name=page_id]').val(),
				'news_id':				current.find('input[name=news_id]').val(),
				'_cat_ajax':			1
			};
		dialog_confirm( 
			cattranslate( 'Do you really want to delete this entry?' ),
			cattranslate( 'Deleting entry' ),
			CAT_URL + '/modules/blacknews/ajax/delete_entry.php',
			dates,
			'POST',
			'JSON',
			false,
			function( data, textStatus, jqXHR )
			{
				var current			= $(this);
				var current_li		= current.find('input[value=' + data.news_id + ']').closest('.bn_icon-feed');
				if( current_li.index() > 0 ){
					current_li.prev('li').click();
				}
				else {
					current_li.next('li').click();
				};
				current_li.remove();
			},
			current.closest('.blacknews_container')
		);
	});
	$('.blacknews_entries').sortable(
	{
		axis:			'y',
		update:			function(event, ui)
		{
			var current			= $(this),
				form			= current.closest('.blacknews_container').find('form'),
				dates			= {
				'positions':		current.sortable('toArray'),
				'section_id':		form.find('input[name=section_id]').val(),
				'page_id':			form.find('input[name=page_id]').val(),
				'_cat_ajax':		1
			};
			$.ajax(
			{
				type:		'POST',
				url:		CAT_URL + '/modules/blacknews/ajax/reorder.php',
				dataType:	'json',
				data:		dates,
				cache:		false,
				beforeSend:	function( data )
				{
					data.process	= set_activity( 'Sort entries' );
				},
				success:	function( data, textStatus, jqXHR  )
				{
					console.log(data);
					if ( data.success === true )
					{
						return_success( jqXHR.process, data.message );
					}
					else {
						return_error( jqXHR.process , data.message );
					}
				},
				error:		function(jqXHR, textStatus, errorThrown)
				{
					return_error( jqXHR.process , errorThrown.message);
				}
			});
		}
	});
});