// on load stuff 
$(document).ready(function () {
    // Hiding the second button on load. If we reuse the first button safari doesnt like it and tries to resubmit the json to gov
    $("#reloadButton").hide();
    $("#learnmoreButton").hide();

    $("#lookupButton").click(function () {
        petitionLookup();
    });

    $("#reloadButton").click(function () {

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

    // Validating our postcode to make sure its actually a postcode
    if (!postcodeIDRaw.match(/^([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/g)) {
        alert("Please enter a valid UK Postcode");
        return;
    }


    // Removing the space from the input of the postcode
    var postcodeID = postcodeIDRaw.replace(/\s/g, '');
    // Spliting the petition to its core numbers
    var petitionID = petitionIDRaw.match(/\d+/g).map(Number)[0];

    // we use jquery to get the json data from the gov
    $.getJSON(`https://petition.parliament.uk/petitions/${petitionID}.json`).done(function (petitionData) {
        // checking if its an archived petition 
        if (petitionData.data.type == "archived-petition") {
            alert("This site doesn't support getting vote data from archived petitions");
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
                    var via_full_count = `${first_3}000`
                    break;
                case 5:
                    // 10,000
                    var first_3 = signs.substring(0, 2);
                    var via_full_count = `${first_3},000`;
                    break;
                case 6:
                    // 100,000
                    var first_3 = signs.substring(0, 3);
                    var via_full_count = `${first_3},000`;
                    break;
                case 7:
                    // 1,000,000
                    var first_3 = signs.substring(0, 1);
                    var via_full_count = `${first_3},000,000`;
                    break;
                case 8:
                    // 10,000,000
                    var first_3 = signs.substring(0, 2);
                    var via_full_count = `${first_3},000,000`;
                    break;
                case 9:
                    // 100,000,000
                    var first_3 = signs.substring(0, 3);
                    var via_full_count = `${first_3},000,000`;
                    break;
            }
            // gathering the data from the gov using the id in the array 
            $("#votesinarea").text(`${petitionData.data.attributes.signatures_by_constituency[array_county].signature_count} out of the ${via_full_count} votes for "${petitionData.data.attributes.action}" are from "${petitionData.data.attributes.signatures_by_constituency[array_county].name}"`);
            // saying the name of the mp incase someone wanted to talk to them 
            $("#MemberOfParliament").text(`Your constituent's Member Of Parliament is "${petitionData.data.attributes.signatures_by_constituency[array_county].mp}"`)
            // bottom button row
            // reload button
            $("#reloadButton").text(`Check another petition`);
            $("#reloadButton").click(function () {
                location.reload(true); // reload(true) | safari is horrible for javascript please dont judge this 
            });
            $("#reloadButton").fadeIn(1525);
            // find our more button 
            $("#learnmoreButton").text(`Find more information about the petition "${petitionData.data.attributes.action}"`);
            $("#learnmoreButton").click(function () {
                location = `https://petition.parliament.uk/petitions/${petitionID}`; // going to the petition
            });
            $("#learnmoreButton").fadeIn(1525);
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