// on load stuff 
$(document).ready(function () {
    console.log(`Running on Github Pages\n\nhttps://whovoted.joshuanoakes.co.uk/\nhttps://github.com/Joshua-Noakes1/how-many-people-voted-in-your-area/\n\nVersion: 1.0.2`)
    // Hiding the second button on load. If we reuse the first button safari doesnt like it and tries to resubmit the json to gov
    $("#reloadButton").hide();

    $("#lookupButton").click(function () {
        petitionLookup();
    });
});

// petitionLookup
function petitionLookup() {
    // loading the input from our Petition URL and Postcode
    var petitionIDRaw = document.getElementById("petitionID").value;
    var postcodeIDRaw = document.getElementById("postcodeID").value;

    // checking if theres data in the petition and postcode boxes
    if (petitionIDRaw == undefined || petitionIDRaw == "") {
        alert("Please enter a UK Petition URL");
        return;
    }
    if (postcodeIDRaw == undefined || postcodeIDRaw == "") {
        alert("Please enter a UK Postcode");
        return;
    }

    // Removing the space from the input of the postcode
    var postcodeID = postcodeIDRaw.replace(/\s/g, '');
    // Spliting the petition to its core numbers
    var petitionID = petitionIDRaw.match(/\d+/g).map(Number)[0];

    // Validating our postcode to make sure its actually a postcode
    if (!postcodeID.match(/^([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/g)) {
        alert("Please enter a valid UK Postcode");
        return;
    }

    // we use jquery to get the json data from the gov
    $.getJSON(`https://petition.parliament.uk/petitions/${petitionID}.json`).done(function (petitionData) {
        // checking if its an archived petition 
        if (petitionData.data.type == "archived-petition") {
            alert("This site doesn't support getting vote data from archived petitions");
            return;
        }
        if (petitionData.data.attributes.state == "rejected") {
            alert("This site doesn't support rejected petitions");
            return;
        }
        // Fading anything that doesnt need to be on screen
        $("#appHelp").fadeOut(1000);
        $("#petitionIDHelp").fadeOut(1000);
        $("#petitionID").fadeOut(1000);
        $("#postcodeIDHelp").fadeOut(1000);
        $("#postcodeID").fadeOut(1000);
        $("#postcodeIDHelp2").fadeOut(1000);
        $("#lookupButton").fadeOut(1000);
        // We make the json call to ukpostcodes so we can get the ONS details
        $.getJSON(`https://findthatpostcode.uk/postcodes/${postcodeID}.json`).done(function (postcodeData) {
            // finding the id in the array of the county of the postcode 
            var array_county = petitionData.data.attributes.signatures_by_constituency.findIndex(ons => ons.ons_code == postcodeData.data.attributes.pcon);

            // Out of numbers (450 out of 67.4k votes)
            var signs = `${petitionData.data.attributes.signature_count}`;
            switch (signs.length) {
                case 4:
                    // below is getting 5 from 5,367 | 1000
                    var first_3 = signs.substring(0, 1);
                    var last_3 = signs.substring(1, 4);
                    var via_full_count = `${first_3},${last_3}`;
                    break;
                case 5:
                    // 10,000
                    var first_3 = signs.substring(0, 2);
                    var last_3 = signs.substring(2, 5);
                    var via_full_count = `${first_3},${last_3}`;
                    break;
                case 6:
                    // 100,000
                    var first_3 = signs.substring(0, 3);
                    var last_3 = signs.substring(3, 6);
                    var via_full_count = `${first_3},${last_3}`;
                    break;
                case 7:
                    // 1,000,000
                    var first_3 = signs.substring(0, 1);
                    var last_3 = signs.substring(1, 4);
                    var last_3_2 = signs.substring(4, 7);
                    var via_full_count = `${first_3},${last_3},${last_3_2}`;
                    break;
                default:
                    var via_full_count = signs;
                    break;
            }

            //checking if the area has signatures 
            if (petitionData.data.attributes.signatures_by_constituency[array_county] == undefined) {
                // we just do empty or 0 things if it doesnt
                var county_sigs_count = '0';
                var county_sigs_mp = 'We can\'t find your constituent\'s Member of Parliament';
            } else {
                var county_sigs_count = petitionData.data.attributes.signatures_by_constituency[array_county].signature_count;
                var county_sigs_mp = `Your constituent's Member Of Parliament is "${petitionData.data.attributes.signatures_by_constituency[array_county].mp}"`;
            }
            // gathering the data from the gov using the id in the array 
            $("#votesinarea").text(`${county_sigs_count} out of the ${via_full_count} votes for "${petitionData.data.attributes.action}" are from "${postcodeData.data.attributes.ward_name}"`);
            // saying the name of the mp incase someone wanted to talk to them 
            $("#MemberOfParliament").text(county_sigs_mp);
            // bottom button row
            // reload button
            $("#reloadButton").text(`Check another petition`);
            $("#reloadButton").click(function () {
                location.reload(true); // reload(true) | safari is horrible for javascript please dont judge this 
            });
            $("#reloadButton").fadeIn(1525);
        }).fail(function () {
            // findthatpostcodeuk could be bad and it could stop working
            alert(`We've failed to load data about ${postcodeID}\nAre you sure it exists?`);
            return;
        });
    }).fail(function () {
        // the gov could block json access
        alert(`We've failed to load the petition "${petitionID}\nAre you sure it exists?`);
        return;
    });
}