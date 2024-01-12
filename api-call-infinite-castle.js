const apipathroot = 'https://infinite-castles.azurewebsites.net';
const emptycheststatus = 'This chest is empty :/ Try another one!'
const tresurelist = [];
const roomstovisit = ['/castles/1/rooms/entry'];
var explorationcount = 0
const roomExplorationGoalNb = 200;
const maxConcurrency = 10;
var activeRequests = 0;
var openedChestCount = 0;
var discoveredChestCount = 0;

const exploreRoom = async (roomname) => {
    if (activeRequests >= maxConcurrency) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        return exploreRoom(roomname);
    }
    activeRequests++;
    explorationcount++;
    console.log('Explored rooms:' + explorationcount + '/' + roomstovisit.length);    

    const response = await fetch(apipathroot + roomname);
    const data = await response.json();

    // Open room chests
    const chests = data.chests;
    if (chests.length > 0) {
        discoveredChestCount += chests.length;
        chests.forEach(chest => openChest(chest));
    }

    // Add doors to the list of room to visit
    const doors = data.rooms;
    if (doors.length > 0) {
        doors.forEach(door => {
            if (!roomstovisit.includes(door) && roomstovisit.length<roomExplorationGoalNb) {
                roomstovisit.push(door);
                //console.log('Adding door : '+door);
                //exploreRoom(door);
            }
        });
    }
    activeRequests--;
};

const openChest = async (chest) => {
    if (activeRequests >= maxConcurrency) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        return openChest(chest);
    }
    activeRequests++;
    openedChestCount++;
    console.log('Opened chests: ' + openedChestCount + '/' + discoveredChestCount);

    const response = await fetch(apipathroot + chest);
    const data = await response.json();
    const chestcontent = data.status;
    const chestID = data.id;
    //console.log(obj.id);
    if (chestID == undefined) {
        console.log(chest);
        console.log(data);
    }
    if (chestcontent != emptycheststatus) {
        tresurelist.push(chestID);
        console.log('Treasure found! ' + chestcontent + ' ' + chestID);
    }
    activeRequests--;
};

var eventify = function(arr, callback) {
    arr.push = function(e) {
        Array.prototype.push.call(arr, e);
        callback(arr);
    };
};

const displayTreasure = async () => {
    while (explorationcount < roomExplorationGoalNb || openedChestCount < discoveredChestCount) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        return displayTreasure();
    }
    console.log(tresurelist);
}

const enterCastle = async () => {
    exploreRoom('/castles/1/rooms/entry');
    displayTreasure();
};

eventify(roomstovisit, function(updatedArr) {
    if (explorationcount < roomExplorationGoalNb) {
        exploreRoom(roomstovisit[roomstovisit.length-1]);
        //console.log('Rooms added:'+roomstovisit.length);
    } else {
        console.log(tresurelist);
    }
});

enterCastle();