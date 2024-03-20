const $ = (el: any) => document.querySelector(el);
function setNativeValue(element: any, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
    } else {
        valueSetter.call(element, value);
    }
}
$("textarea").focus();
window.API.onMessage((action: string, param: string) => {
    console.log(action, param)
    switch (action) {
        case 'clipboard':
            setNativeValue($("textarea"), param);
            $("textarea").dispatchEvent(new Event('input', { bubbles: true }));
            break;
    }
}); 0