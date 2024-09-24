
        document.addEventListener('DOMContentLoaded', function () {
            openCorrectPopup();
        });

        function openCorrectPopup() {
            var screenWidth = window.innerWidth;
            if (screenWidth >= 476) {
                openPopup('popup-desktop');
            } else {
                openPopup('popup-mobile');
            }
        }

        function openPopup(popupId) {
            document.getElementById(popupId).classList.add('active');
        }

        function closePopup(popupId) {
            document.getElementById(popupId).classList.remove('active');
        }

        document.getElementById('popup-desktop').addEventListener('click', function (e) {
            if (e.target === this) {
                closePopup('popup-desktop');
            }
        });

        document.getElementById('popup-mobile').addEventListener('click', function (e) {
            if (e.target === this) {
                closePopup('popup-mobile');
            }
        });
    