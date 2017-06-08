$(function () {
	$(".parallax-div").parallax(
		{imageSrc: "assets/img/woman-typing.jpg"});
	$(".parallax-div2").parallax(
		{imageSrc: "assets/img/hackathon.jpg"});
});

TweenMax.from(".wwclogo", 1.5,{scale:"2", opacity:"0", overwrite:"none"});


TweenMax.from(".apply_button", 1.5,{rotation:"-10", overwrite:"none"});


$(".infowindows").waypoint(function () {
	TweenMax.from(".window1", 1.5,{left:"150px", opacity:"0", overwrite:"none"});
}, {
	offset: '50%'
})

$(".facts").waypoint(function () {
	$(".counter").each(function() {
	  var $this = $(this),
	      countTo = $this.attr('data-count');
	  
	  $({ countNum: $this.text()}).animate({
	    countNum: countTo
	  },

	  {
	    duration: 2000,
	    easing:'linear',
	    step: function() {
	      $this.text(Math.floor(this.countNum));
	    },
	    complete: function() {
	      $this.text(this.countNum);
	      //alert('finished');
	    }

	  });  
	  
	});

	TweenMax.from(".counter_parent", 1.5,{top:"-150px", opacity:"0", overwrite:"none"});
}, {
	offset: '50%'
})







