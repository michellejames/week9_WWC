$(function () {

	TweenMax.from(".menu-button", 1 ,{scale:"2", yoyo: true, repeat: 4, overwrite:"none"});

	//Women Who Code logo
	TweenMax.from(".hero__wwclogo", 1.5,{scale:"3", opacity:"0", overwrite:"none"});

	//Navbar
	$(".menu-button").on("click", function () {
		$("nav").toggleClass("open");
	});

	//ScrollTo 
	$(".home").on("click", function () {
		$.scrollTo($("header"), 400);
	});

	$(".scroll-to-infowindows").on("click", function () {
		$.scrollTo($(".infowindows"), 400);
	});

	$(".scroll-to-member").on("click", function () {
		$.scrollTo($(".data"), 400);
	});

	//Parallax
	$(".parallax__womantyping").parallax(
		{imageSrc: "assets/img/woman-typing.jpg"});
	$(".parallax__hackathon").parallax(
		{imageSrc: "assets/img/hackathon.jpg"});
});



//Application Wiggl Button
$(".application").waypoint(function () {
	TweenMax.from(".button", 0.2,{rotation:"-3", yoyo: true, repeat:-1, overwrite:"none"});

}, {
	offset: '25%'
})


//Infowindows swipping in from sides
$(".infowindows").waypoint(function () {
	$('.window1').toggleClass('active');
}, {
	offset: '40%'
})

$(".infowindows").waypoint(function () {
	$('.women').toggleClass('active');
}, {
	offset: '30%'
})


$(".infowindows").waypoint(function () {
	$('.window2').toggleClass('active');
}, {
	offset: '20%'
})

$(".infowindows").waypoint(function () {
	$('.window3').toggleClass('active');

}, {
	offset: '0%'
})

$(".infowindows").waypoint(function () {
	$('.window4').toggleClass('active');
}, {
	offset: '-20%'
})

//
$(".data").waypoint(function () {
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

	$('.counter_parent').toggleClass('active');
}, {
	offset: '20%'
})




	//Member Wiggle Button
	TweenMax.from(".member_button", 0.2,{rotation:"-3", yoyo: true, repeat:-1, overwrite:"none"});


