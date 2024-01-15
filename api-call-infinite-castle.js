const apipathroot = 'https://infinite-castles.azurewebsites.net';
const emptycheststatus = 'This chest is empty :/ Try another one!'
const treasureList = [];
const roomsToVisit = new Set(['/castles/1/rooms/entry']);
const visitedRooms = new Set();
var explorationcount = 0
var openedChestCount = 0;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const exploreRoom = async (roomname) => {
    explorationcount++;
    try {
        const response = await fetch(apipathroot + roomname);
        const data = await response.json();
        data.chests.forEach(chest => openChest(chest));
        data.rooms.forEach(door => {
            if (!visitedRooms.has(door)) {
                roomsToVisit.add(door);
            }
        });
        visitedRooms.add(roomname);
    } catch (error) {
        console.error('Error exploring room:', error);
    } 
};

const openChest = async (chest) => {
    try {
        const response = await fetch(apipathroot + chest);
        const data = await response.json();
        if (data.status && data.id) {
            if (data.status !== emptycheststatus) {
                treasureList.push(data.id);
                console.log('Treasure found! ' + data.status + ' ' + data.id);
            }
            openedChestCount++;
        } else {
            console.error('Data missing in chest response:', data);
            await delay(1000);
            return openChest(chest);
        }
    } catch (error) {
        console.error('Error opening chest:', error);
    }
};

const startExploration = async () => {
    while (roomsToVisit.size > 0) {
        const [nextRoom] = roomsToVisit;
        roomsToVisit.delete(nextRoom);
        await exploreRoom(nextRoom);
    }
    console.log('Exploration complete. Treasures found:', treasureList);
    console.log('Opened chests: ' + openedChestCount);
    console.log('Visited rooms: ' + explorationcount);
};

startExploration();