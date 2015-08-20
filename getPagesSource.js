//don't think I actually have to do all of this, should be able to just parse dom as normal. 
function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    return html;
}

chrome.extension.sendMessage({
    action: "getSource",
    //source: DOMtoString(document)
    source: getInnerHTML(document)
});


function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function getInnerHTML(document_root) {

    //Some random times Jquery fails to load
    try {
    console.log($().jquery);
    }
    catch(err) {
        return "<h4>jQuery Failed to Load<br/>Refresh Your Page</h4>";
    }
    
   var html = DOMtoString(document_root);

    //html = $.parseHTML( html );
    //data-widget-id="2UlPUp6GWUZ"
    var widgets = [];
    var widget_ids = [];
    //widgets = getIndicesOf("data-widget-id", html, false);
    widgets = getIndicesOf("www.findthebest.com/w/", html, false);

    var output ="";
    var widg_id="";
    var small_html ="";
    for (var i = 0; i < widgets.length; i++) {
        var sec_indx =0;
        if(html.indexOf('?', widgets[i]+22) > html.indexOf('"', widgets[i]+22) ){
            sec_indx =html.indexOf('"', widgets[i]+22);
        } else {
            sec_indx =html.indexOf('?', widgets[i]+22);
        }
        widg_id = html.substring(widgets[i]+22,sec_indx );
        widget_ids.push(widg_id);
    }
    //check for standalone widget url page

    if(widget_ids === undefined || widget_ids.length == 0){

        var base = document.URL.indexOf(".com/w/");

        var sec_indx =0;
        if(document.URL.indexOf('?') > 0 && base >0) {
            sec_indx =document.URL.indexOf('?');
        }else {
            sec_indx =document.URL.length;
        }

        if( base>0 ){
            widget_ids.push(document.URL.substring((document.URL.indexOf(".com/w/")+7),sec_indx));
        }
    }

    var uniqueIds = [];
    $.each(widget_ids, function(i, el){
        if($.inArray(el, uniqueIds) === -1) uniqueIds.push(el);
    });

    for (var i = 0; i < uniqueIds.length; i++) {
        
        //output+= i +"-"+ uniqueIds[i] + "<br />";
        output+= getWidgHtml(uniqueIds[i], i);
        output+= "<br />";
    }



  
    if(output.length==0){
        output+="<h4>No Widgets Found on Page...</h4>";
    }else{
        output+="<br /><br />";
    }
    
    return output;
    

}


function getWidgHtml(wid_id, id) {
    var response = '';
    var ll = $.ajax({ type: "GET",   
         url: "http://54.187.238.59/misc/papi.php?widget_id="+wid_id,   
         async: false,
         success : function(text)
         {
         }
    });

    var widget_info = JSON.parse(ll.responseText);
    //console.log(widget_info);
    if(widget_info.responseText===false){
        var widgHtml = "";
        widgHtml += "<div class ='widg' style='min-height: 100px;' >";
        widgHtml +="<center><h3>Widget "+wid_id+" has no info</h3></center>";
        widgHtml += "</div>";
        return widgHtml;

    }

    var detail_widget_info = JSON.parse(widget_info.data);

    //console.log(widget_info);
    //console.log(detail_widget_info);

    var widgHtml = "";
    widgHtml += "<div class ='widg'>";
    widgHtml +="<center><h3>Widget #"+(id+1)+"</h3></center>";
    widgHtml +="<table>";
    widgHtml += "<tr><td>Widget ID:</td><td><a href='http://widgets.findthebest.com/l/"+detail_widget_info.id+"/"+widget_info.encoded_title+"' target='_blank'>"+wid_id+"</a></td></tr>";
    widgHtml += "<tr class='spaceUnder'><td>Widget Created:</td><td>"+detail_widget_info.added_time+"</td></tr>";
    widgHtml += "<tr><td>All Time PVs Kibana:</td><td>"+numberWithCommas(detail_widget_info.all_time_pageviews_kibana)+"</td></tr>";
    widgHtml += "<tr><td>7 Day PVs Kibana:</td><td>"+numberWithCommas(detail_widget_info.pageviews_7days_kibana)+"</td></tr>";
    widgHtml += "<tr class='spaceUnder'><td>All Time Visits to FTB:</td><td>"+detail_widget_info.all_time_visits_to_ftb+"</td></tr>";
    widgHtml += "<tr><td>Pulled From:</td><td>"+detail_widget_info.source+"</td></tr>";
    widgHtml += "<tr><td>Creator:</td><td>"+detail_widget_info.user_name+"</td></tr>";
    widgHtml += "<tr><td>Widget Type:</td><td>"+detail_widget_info.widget_type+"</td></tr>";
    widgHtml += "<tr class='spaceUnder'><td># Embedding URLs:</td><td><a href='http://widgets.findthebest.com/l/"+detail_widget_info.id+"/"+widget_info.encoded_title+"' target='_blank'>"+detail_widget_info.num_embedding_urls+"</a></td></tr>";
    widgHtml += "<tr><td>Topic:</td><td><a href ='http://"+detail_widget_info.comp+"' target='_blank'>"+detail_widget_info.comp_name+"</a>(<a href ='http://"+detail_widget_info.comp+"/app_admin/layout/widget_editor' target='_blank'>widget editor</a>)</td></tr>";
    widgHtml += "<tr><td>AppID:</td><td>"+detail_widget_info.app_id+"</td></tr></table>";
   
    widgHtml += "<a href ='http://"+detail_widget_info.widget_url+"' target='_blank'><img src='"+widget_info.main_image_url+"'  height='200' width='180'></a><br />";
    widgHtml += "</div>";
    //console.log(widgHtml);
    return widgHtml;

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


