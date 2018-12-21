
function repeat(fn, n) {
    for (var i = 0; i < n; i++) {
        fn(i);
    }
}

function iter(list, fn) {
    repeat(i => fn(list[i], i), list.length)
}

function bold(el) {
    if (!el.classList.contains("font-weight-bold")) {
        el.classList += "font-weight-bold";
    }
}

function unbold(el) {
    el.classList.remove("font-weight-bold");
}
