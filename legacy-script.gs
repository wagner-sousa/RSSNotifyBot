var RELEASES = JSON.parse(getProperty('RELEASES'));

var GOOGLE_SHEETS_FILE_LINK = JSON.parse(getProperty('SHEET'));
var BUG_FIX_TAB = 'Correções';
var ADDED_TAB = 'Novidades';
var CONFIG_TAB = 'BOT';
var TASK_TAB = 'TKT';

var CONFIGS = getValuesTab(CONFIG_TAB);
var CONFIGURATION_VALUE_INDEX = 1;

var WEBHOOK_CHAT = 0;
var FEED = 1;
var LOGO_URL = 2;
var DEBUG = 3;
var DOC_RELEASE = 4;
var CLIENTS = 5;
var TASKS_TYPES = 6;
var WEBHOOK_DEBUG = 7;

var NAME_TASK = 0;
var TASK_LINK = 1;
var CLIENT_TASK = 2;

var NAME_NEW = 0;


var ADDEDS = getValuesTab(ADDED_TAB);
var BUGS = getValuesTab(BUG_FIX_TAB);
var TASK_SERVICES = getValuesTab(TASK_TAB);

var ATOM = XmlService.getNamespace('http://www.w3.org/2005/Atom');
var IMAGE = XmlService.getNamespace('http://search.yahoo.com/mrss/');


function debug()
{
  var tag = getLastTag();
  Logger.log(tag);
  message = makeMessage(tag);
  sendChatMensage(message);
  return;
  setProperty(tag.version);
}

function main()
{
  return;
  var tag = getLastTag();
  
  if(validateTag(tag))
  {
    message = makeMessage(tag);

    sendChatMensage(message);
    sendMail(tag);

    setProperty(tag.version);
  }
}

function validateTag(tag)
{
  Logger.log('Validando TAG...');
  if(getParameterValue(DEBUG) == 1)
  {
    Logger.log('SCRIPT em modo DEBUG...');
    return true;
  }

  if(RELEASES.includes(tag.version))
  {
    Logger.log('RELEASE: [' + tag.version + '] já notificado');
    return false;
  }

  if(!tag.date)
  {
    Logger.log('TAG: [' + tag.version + '] não é um release');
    return false;
  }

  var regex = new RegExp( '[a-zA-Z]+', "i");
  if(regex.test(tag.version))
  {
    Logger.log('RELEASE: [' + tag.version + '] não é oficial!');
    return false;
  }

  return true;
}

function makeReleaseList(items)
{
  var keyValues = [];
  if(items.length == 0) return [];

  var v = 0

  var list = [];

  items.forEach(function(line){
    var item = makeReleaseItem(line);
    if(Object.keys(item).length)
    {
      list.push(item);
    }
  });
  return list;
}

function makeObjTag(tag)
{
  var user_thumbnail = null;
  tag.getChildren().forEach(function(value, index){
    if(value.getName() == 'thumbnail')
    {
      user_thumbnail = value.getAttribute('url').getValue();
    }
  });

  return {
    version: getXmlValue(tag, 'title').getText(),
    comments: getXmlValue(tag, 'content').getText().replaceAll('\u0026#x000A;', '').replaceAll('</b>','</b><br/>').replaceAll('</li>', '</li><br/>').replaceAll('</ul>', '</ul><br/>'),
    date: getXmlValue(tag, 'updated') ? Utilities.formatDate(new Date(getXmlValue(tag, 'updated').getText()), 'America/Sao_Paulo', 'dd/MM/YYYY') : null,
    user_thumbnail: user_thumbnail,
    user_name: getXmlValue(getXmlValue(tag, 'author'), 'name').getText(),
  };
}

function setProperty(value)
{
  Logger.log('RELEASE: [' + value + '] notificado com sucesso!');
  RELEASES.push(value);
  PropertiesService.getScriptProperties().setProperty('RELEASES', JSON.stringify(RELEASES));
}

function getProperty(field)
{
  var property = PropertiesService.getScriptProperties().getProperty(field);
  Logger.log('Últimos RELEASES: [' + property + ']');
  return property;
}

function getValuesTab(tab)
{
  var data = SpreadsheetApp.openByUrl(GOOGLE_SHEETS_FILE_LINK).getSheetByName(tab).getDataRange().getValues();
  var lines = [];
  data.forEach(function(values, line){
    if(line != 0) lines.push(values);
  });
  return lines;
}

function getParameterValue(line)
{
  return CONFIGS[line][CONFIGURATION_VALUE_INDEX];
}

function getFeed()
{
  Logger.log('Conectando ao GITLAG...');
  Logger.log('Feed Utilizado: ' + getParameterValue(FEED));
  var xml = UrlFetchApp.fetch(getParameterValue(FEED)).getContentText();
  var document = XmlService.parse(xml);
  Logger.log('Retorno do Feed: '+ document);
  Logger.log('Dados Obtidos: ' + document.getRootElement());
  return document.getRootElement();
}

function getLastTag()
{
  xml = getFeed();
  var tag = xml.getChild('entry', ATOM);
  tag = makeObjTag(tag);

  Logger.log('TAG [' + tag.version + '] encontrada');
  return tag;
}

function getXmlValue(xml, field)
{
  return xml.getChild(field, ATOM);
}

function makeMessage(tag)
{
  if(getParameterValue(DEBUG) == 1)
  {
    Logger.log('Dados do RELEASE');
    Logger.log(tag);
  }
  Logger.log('Montando mensagem...');

  return {
    cards: [{
        "header": {
          "title": "Liberação " + getParameterValue('APP_NAME'),
          "subtitle": 'VERSÃO: ' + tag.version,
          "imageUrl": getParameterValue(LOGO_URL)
        },
        sections: makeSections(tag)
      }]
    //,"text": "Em quais clientes foram liberados <users/116574772461647171091>?"
    };
}

function getListBugFixed()
{
  var keyValues = [];
  if(BUGS.length == 0) return [];
  BUGS.forEach(function(bug){
    keyValues.push({
        "keyValue": {
          "content": bug[NAME_TASK],
          "contentMultiline": "false",
          "bottomLabel": bug[CLIENT_TASK],
          "button": {
              "imageButton": {
                  "iconUrl": "https://cdn.icon-icons.com/icons2/903/PNG/512/bookmark_icon-icons.com_69556.png",
                  "onClick": { 
                      "openLink": {
                          "url": bug[TASK_LINK]
                      }
                  }
                }
            }
        }
      });
  });

  return [{ 'widgets': keyValues}];
}

function makeItemLineMessage(item)
{
  var header_title = '[' + item.client + ']' + (item.manual ? ' - ' + item.manual : '');
  var obj = {
        "content": item.title,
        "contentMultiline": "true",
        "topLabel": '<b>' + header_title + '</b>',
  };

  if(item.url)
  {
    obj['button'] = {
            "imageButton": {
                "iconUrl": "https://cdn.icon-icons.com/icons2/903/PNG/512/bookmark_icon-icons.com_69556.png",
                "onClick": { 
                    "openLink": {
                        "url": item.url,
                    }
                }
              }
    };
    obj["bottomLabel"] = item.task;
  }

  return obj;
}

function makeReleaseItem(line)
{
  Logger.log(line.getText());
  if(line.getText().startsWith('['))
  {
    var filterstrings = getParameterValue(CLIENTS).split(',');
    var regex = new RegExp( filterstrings.join( "|" ), "i");
    var data = line.getText().split(/\\[(.*?)\\]/);
    data = data.filter(function (el) {return el;});
    if(regex.test( line.getText() ))
    {
      var filterstrings = getParameterValue(TASKS_TYPES).split(',');
      var regex = new RegExp( filterstrings.join( "|" ), "i");
      var item = {
        'client': data[0].toUpperCase(),
        'manual': data[3] ? data[3].toUpperCase() : null,
        'title': data[2],
        'url': regex.test( data[1] ) ? getUrlTask(data[1]) : null,
        'task': regex.test( data[1] ) ? data[1].toUpperCase() : null
      };
    }

    return item;
  }
  else
  {
    return line.getText();
  }

}
function getListDoc(items)
{
  var keyValues = [];
  Logger.log(items);
  if(items.length == 0) return [];

  var v = 0

  var list = [];

  items.forEach(function(line){
    if(line.getText().startsWith('#Versão ')) v += 1;

    if(v == 1)
    {
      var item = makeReleaseItem(line);
      var obj = makeItemLineMessage(item);
      if(item.length)
      {
        keyValues.push({"keyValue": obj}); 
        list.push(item);
      }
    }
  });
  
  if(keyValues.length == 0) return [];
  return [{ 'widgets': keyValues}];
}

function makeListItemsMessage(items)
{
  var keyValues = [];
  if(items.length == 0) return [];

  items.forEach(function(item){
    var obj = makeItemLineMessage(item);
    keyValues.push({"keyValue": obj}); 
  });
  
  if(keyValues.length == 0) return [];
  return [{ 'widgets': keyValues}];
}

function getUrlTask(data)
{
  var values = data.split('#');
  var task = values[1];
  var service = TASK_SERVICES.filter(function(service){
    var regex = new RegExp( values[0], "i");
    return regex.test(service[1]);
  }).shift();
  var url = service[2];
  return url + task
}

function getListNew()
{
  var keyValues = [];
  if(ADDEDS.length == 0) return [];
  ADDEDS.forEach(function(add){
    keyValues.push({
      "keyValue": {
          "content": '<b>' + add[NAME_NEW] + '</b>',
          "contentMultiline": "false",
        }
    });
  });
  
  return [{ 'widgets': keyValues}];
}

function makeSections(tag)
{
  var widgets = [];
  
  if(getParameterValue(DEBUG) == 1)
  {
    widgets.push(makeSectionHeader("MODO DEBUG ATIVADO", "https://cdn.icon-icons.com/icons2/2721/PNG/512/error_circle_warning_exclamation_icon_175543.png"));
  }

  widgets.push({
      "widgets": [{
            "keyValue": {
              "topLabel": "Responsável:",
              "content": tag.user_name,
              "bottomLabel": tag.date ? '<b>Data da versão: </b>' + tag.date : '',
              "contentMultiline": "false",
              "iconUrl": tag.user_thumbnail,
            }
          },
        ]
  });

  widgets.push(makeSectionHeader("Release Notes", "https://cdn.icon-icons.com/icons2/2802/PNG/512/pen_icon_178748.png"));
  widgets.push({
    "widgets": [
      {
        "textParagraph": {
          "text": tag.comments
        }
      }
    ]
  });
  
  widgets.push({
    "widgets": [{
      "buttons": [
        {
          "textButton": {
            "text": "Veja mais detalhes da liberação",
            "onClick": {
              "openLink": {
                "url": getParameterValue(DOC_RELEASE)
              }
            }
          }
        }
      ]
    }]
  });
  
  /*
  if(getParameterValue(DOC_RELEASE))
  {
    var doc = getListDoc(DocumentApp.openByUrl(getParameterValue(DOC_RELEASE)).getBody().getParagraphs());
    if(doc.length)
    {
      if(doc.length > 0)
      {
        widgets.push(makeSectionHeader("Release Notes", "https://cdn.icon-icons.com/icons2/2802/PNG/512/pen_icon_178748.png"));
        doc.forEach(function (item){
          widgets.push(item);
        });
      }
      widgets.push({
              "widgets": [{
              "buttons": [
                {
                  "textButton": {
                    "text": "Veja mais detalhes da liberação",
                    "onClick": {
                      "openLink": {
                        "url": getParameterValue(DOC_RELEASE)
                      }
                    }
                  }
                }
              ]
      }]
      });
    }
  }
  else
  {
    bugs = getListBugFixed();
    if(bugs.length)
    {
      widgets.push(makeSectionHeader("Correção de erros", "https://cdn.icon-icons.com/icons2/2367/PNG/512/circle_x_close_icon_143475.png"));

      bugs.forEach(function (item){
        widgets.push(item);
      });
    }
    /*else{
      widgets.push(makeSectionHeader("Correção de erros", "https://cdn.icon-icons.com/icons2/2367/PNG/512/circle_x_close_icon_143475.png"));
      widgets.push({
            "widgets": [
              {
                "textParagraph": {
                  "text": '<i>Não informado</i>',
                }
              }
            ]
      });
    }

    news = getListNew();
    if(news.length)
    {
      widgets.push(makeSectionHeader("Novidades", "https://cdn.icon-icons.com/icons2/903/PNG/512/plus_icon-icons.com_69476.png"));
      news.forEach(function (item){
        widgets.push(item);
      });
    }
    else{
      widgets.push(makeSectionHeader("Novidades", "https://cdn.icon-icons.com/icons2/903/PNG/512/plus_icon-icons.com_69476.png"));
          widgets.push({
            "widgets": [
              {
                "textParagraph": {
                  "text": '<i>Não informado</i>',
                }
              }
            ]
      });
    }

  }
  */

  return widgets;
}

function makeSectionHeader(title, icon_url)
{
  return {
        "widgets": [
          {
            "keyValue": {
              "topLabel": " ",
              "content": "<b>" + title + "<b>",
              "contentMultiline": "false",
              "iconUrl": icon_url,
            }
          },
        ]
      };
}

function sendChatMensage(message)
{  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(message)
  };

  Logger.log('Enviando mensagem...');
  let chat = null;
  if(getParameterValue(DEBUG) != 1)
  {
    Logger.log('WEBHOOK utilizado: ' + getParameterValue(WEBHOOK_CHAT));
    UrlFetchApp.fetch(getParameterValue(WEBHOOK_CHAT), options);
  }
  else
  {
    Logger.log('WEBHOOK DEBUG utilizado: ' + getParameterValue(WEBHOOK_DEBUG));
    UrlFetchApp.fetch(getParameterValue(WEBHOOK_DEBUG), options);
  }
  Logger.log('Mensagem enviada com sucesso!');
  
}

function makeListItemsMail(items)
{
  lines = [];
  items.forEach(function(item){
    var link = '<small style="font-size: 10px !important;text-transform: uppercase;">🚩' + item.title + '</small>';
    var title = item.client + '<i style="font-size: 10px !important;text-transform: uppercase;">' + (item.manual ? ' - ' + item.manual : '') + '</i>';
    if(item.task != null)
    {
      link = '<a href="' + item.url + '" style="font-family: Arial,sans-serif;color: #009ae7;text-decoration: none;display: block;" target="_blank">' + link + '</a>';
      title = '<b style="font-size: 10px !important;text-transform: uppercase;">' + item.task + '</b> - ' + title;
    }

    lines.push('<table style="width:100%;padding-top:15px;border-spacing:0!important;border-collapse:collapse!important;table-layout:fixed!important;margin:0 auto;border:0;text-align:left;" cellpadding="0" cellspacing="0">' +
      '<tbody>' + 
        '<tr>' +
          '<td style="color:#8fa1ac;font-family:Arial,sans-serif;display:block;text-transform:uppercase;padding:0">' + 
            '<span style="font-family:Arial,sans-serif;"><small style="font-size: 10px !important;text-transform: uppercase;">' + title + '</small></span>' +
          '</td>' + 
      '</tr>' + 
      '<tr>' +
        '<td style="color:#566268;font-family:Arial,sans-serif;padding:0">' + link + '</td></tr></tbody></table>');
  });
  return lines.join('');
}

function sendMail(tag)
{
  var mail = HtmlService.createTemplateFromFile('mail');
  mail.logo = getParameterValue(LOGO_URL);
  mail.version = tag.version;
  mail.text = '';
  var html_message = mail.evaluate().getContent().replace('{list}', makeListItemsMail(tag.items));

  var cc = '';
  if(getParameterValue(DEBUG) != 1) cc = getParameterValue('EMAIL_CC');
  var toEmail = getParameterValue('EMAIL'); // Please set the email for `to`.
  var name = "Propulsar";
  var subject = getParameterValue('APP_NAME') + " versão " + tag.version + "  disponível 🚀";
  GmailApp.sendEmail(toEmail, subject, '', {
      'name': name,
      'noReply': true,
      'htmlBody': html_message,
      'bcc': cc
  });
}


