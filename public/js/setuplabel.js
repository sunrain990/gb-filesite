function setupLabel(){
		if($('.label_check input').length) {
			$('.label_check').each(function(){
				$(this).find('i').attr('class','fa fa-square-o');
			});
			$('.label_check input:checked').each(function(){
				$(this).prev('i').attr('class','fa fa-check-square-o');
			});
		};
		if($('.label_radio input').length) {
			$('.label_radio').each(function(){
				$(this).find('i').attr('class','fa fa-circle-o');
			});
			$('.label_radio input:checked').each(function(){
				$(this).prev('i').attr('class','fa fa-dot-circle-o');
			});
		};
	}
	$(function(){
		$('*').attr('hidefocus','true');
		$('.label_check,.label_radio').click(function(){
			setupLabel();
		});
		setupLabel();
});