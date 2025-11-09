 $(".et_pb_module").click(function(){
         $(this).closest(".et_pb_module")
           .find(".et_pb_toggle_content")
           .slideToggle();
    });