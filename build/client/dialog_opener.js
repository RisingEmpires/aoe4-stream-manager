/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**************************************************!*\
  !*** ./src/client/dashboard/js/dialog_opener.ts ***!
  \**************************************************/
__webpack_require__.r(__webpack_exports__);
document.addEventListener('click', (e) => {
    const nodecg = window.nodecg;
    const elWithDialogAttr = e.composedPath()[0].closest('[nodecg-dialog]');
    if (elWithDialogAttr) {
        const dialogName = elWithDialogAttr.getAttribute('nodecg-dialog');
        const dialogId = `${nodecg.bundleName}_${dialogName}`;
        const dialogElement = window
            .top.document.querySelector('ncg-dashboard')
            .shadowRoot.getElementById(dialogId);
        dialogElement.open();
    }
}, false);


/******/ })()
;
//# sourceMappingURL=dialog_opener.js.map