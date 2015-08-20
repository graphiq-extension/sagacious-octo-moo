
chrome.extension.sendMessage({
    action: "getSource",
    //source: DOMtoString(document)
    source: getWidgets(document)
});

function getWidgets() {
    var output ="";
    var highlights ="";

    output += "<div class ='widg' style='min-height: 150px;'>";
    output +="<center><h3>Alchemy Identified Keywords</h3></center>";
  
    


    var search_data="";
    search_data = getSearchEntities();
    highlights = doHighlights(JSON.parse(search_data.alchemy_results));
    output += highlights;
    output += "</div>";
    ftb_results = getFTBents(search_data);
    output += ftb_results;
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    
    output += "</div>";
    return output;
    

}

function getSearchEntities(){

    var response = '';
    var ll = $.ajax({ type: "GET",   
         url: "http://54.187.238.59/misc/papi.php?url="+encodeURIComponent(document.URL),   
         async: false,
         success : function(text)
         {
         }
    });

    var widget_info = JSON.parse(ll.responseText);    
    return widget_info;

}
function doHighlights(text_hits){
    var terms_found = "Terms Found: <br />";
    var items = [];
    items = text_hits.keywords;
    var end = items.length;
    if(items.length>5){
        end =5;
    }

    for (var i = 0; i < end; i++) {
        doSearch(items[i].text);
        terms_found += "<a href='http://www.findthebest.com/widgets/search/search?cid=1&query="+items[i].text +"' target='_blank'>"+items[i].text+"</a> <br />";
    }

    return terms_found;
}

function getFTBents(alc_results){
    
    console.log("aeafdadfad");
    var alchemy_specific_results = JSON.parse(alc_results.alchemy_results);
    var output = "";
    var items = [];
    items = alc_results.items;
    var end = items.length;
    if(items.length>5){
        end =5;
    }

    for (var i = 0; i < end; i++) {

        output+= getListingData(items[i].app_id,items[i].id ) + " <br />";
    }


    return output;

}


function getListingData(aid, lid){
    
    var response = '';
    var ll = $.ajax({ type: "GET",   
         url: "http://54.187.238.59/misc/papi.php?app_id="+aid+"&listing_id="+lid,   
         async: false,
         success : function(text)
         {
         }
    });

    var widget_info = JSON.parse(ll.responseText);

    var detail_widget_info = JSON.parse(widget_info.data);

    //console.log(widget_info);
   //console.log(detail_widget_info);

    var widgHtml = "";
    widgHtml += "<div class ='widg' style='min-height: 150px;'>";
    widgHtml +="<center><h3>Found FindTheBest Entity</h3></center>";
    widgHtml += "Listing: <a href='"+widget_info.detail_url+"' target='_blank'>"+widget_info.title+"</a><br />";
    widgHtml += "<a href='http://www.findthebest.com/widgets/search/search?cid=1&query="+widget_info.title+"' target='_blank'>Search for Visuals</a><br />";
    widgHtml += "<img src='http:"+widget_info.main_image_url+"'  height='120' width='100'><br />";
    widgHtml += "PVs 7 days: "+widget_info.page_views_7_days+"<br />";
    widgHtml += "PVs 30 days: "+widget_info.page_views_30_days+"<br />";
    widgHtml += "</div>";
    return widgHtml;

}


function doSearch(text) {
    if (window.find && window.getSelection) {
        document.designMode = "on";
        var sel = window.getSelection();
        sel.collapse(document.body, 0);
        
        while (window.find(text)) {
            document.execCommand("HiliteColor", false, '#B5E6FF');
            sel.collapseToEnd();
        }
        document.designMode = "off";
    } else if (document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        while (textRange.findText(text)) {
            textRange.execCommand("BackColor", false, '#B5E6FF');
            textRange.collapse(false);
        }
    }
}

