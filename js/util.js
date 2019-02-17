
function repeat(fn, n) {
    for (let i = 0; i < n; i++) fn(i);
}

function iter(list, fn) {
    repeat(i => fn(list[i], i), list.length)
}

function sum(list) {
    let total = 0
    repeat(i => total += list[i], list.length)
    return total
}

function bold(el) {
    if (!el.classList.contains("font-weight-bold")) {
        el.classList += "font-weight-bold";
    }
}

function unbold(el) {
    el.classList.remove("font-weight-bold");
}
