document.querySelectorAll('.container').forEach(function (container) {
    container.addEventListener('click', function (event) {
        let spec = event.currentTarget.id;

        if (spec == "2201") {
            window.location.href = "./projects/deposit1050100/1050100.html";
        } else if (spec == "2202") {
            window.location.href = "./projects/aggpluspath/index.html";
        } else if (spec == "2203") {
            window.location.href = "./projects/egtfreespins/index.html";
        }
    });
});
