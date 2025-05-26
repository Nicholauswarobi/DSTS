        document.addEventListener('DOMContentLoaded', () => {
            const profilePic = document.getElementById('profilePic');
            const profileMenu = document.getElementById('profileMenu');

            // Toggle the visibility of the menu when the profile picture is clicked
            profilePic.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from propagating to the document
                profileMenu.classList.toggle('hidden');
            });

            // Close the menu if clicked outside
            document.addEventListener('click', (event) => {
                if (!profileMenu.contains(event.target) && event.target !== profilePic) {
                    profileMenu.classList.add('hidden');
                }
            });
        });