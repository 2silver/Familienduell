var fragen = null;
var intro = null;
var introVolume = 1;
var jeopardy = null;
var schweinchenVolume = 1;
var jeopardyVolume = 1;
var schweinchen = null;

$(document).ready(function() {

  $("#controllerBtn").click(function() {
    $('body').addClass('controller');
  });
  $("#displayBtn").click(function() {
    $('body').addClass('display');
  });

  $("#fragenListe").sortable();
  $("#fragenListe").disableSelection();

  $("#closePrintScreenIcon").click(function() {
    $("#printScreen").hide();
    $("#allContent").show();
  });

  $("#printQuestions").click(function() {
    $("#printDiv").empty();
    showQuestionsAsPrint();
    $("#printScreen").show();
    $("#allContent").hide();
  });

  $("#blackScreenCheck").change(function() {
    wsSend("toggleBlackScreen", "");
  });

  $("#startJeopardybtn").click(function() {
    $("#startJeopardybtn").attr("disabled", "disabled");
    wsSend("startJeopardy", "");
  });

  $("#stopJeopardybtn").click(function() {
    $("#startJeopardybtn").removeAttr("disabled");
    wsSend("stopJeopardy", "");
  });

  $("#jeopardyVolume").on("input", function() {
    var v = parseFloat($(this).val()) / 10;
    wsSend("setJeopardyVolume", v);
  });

  $("#startScheinchenbtn").click(function() {
    $("#startScheinchenbtn").attr("disabled", "disabled");
    wsSend("startSchweinchen", "");
  });

  $("#stopScheinchenbtn").click(function() {
    $("#startScheinchenbtn").removeAttr("disabled");
    wsSend("stopSchweinchen", "");
  });

  $("#schweinchenVolume").on("input", function() {
    var v = parseFloat($(this).val()) / 10;
    wsSend("setSchweinchenVolume", v);
  });

  $("#addNewQuestionBtn").click(function() {
    addNewQuestion(null);
  });

  $("#openFragenEditorBtn").click(function() {
    $("#editQuestionsDiv").show();
  });

  $("#closeFragenEditorIcon").click(function() {
    $("#editQuestionsDiv").hide();
  });

  $("#saveNewQuestions").click(function() {
    saveQuestions();
    alert("Gespeichert!");
  });

  $("#upQicon").click(function() {
    var index = $("#questionsSelcet>option:selected").index();
    index--;
    setFrageIndex(index);
  });

  $("#downQicon").click(function() {
    var index = $("#questionsSelcet>option:selected").index();
    index++;
    setFrageIndex(index);
  });

  $("#questionsSelcet").on("change", function() {
    changeFrage();
  });

  $("#startIntroBtn").click(function() {
    $("#startIntroBtn").attr("disabled", "disabled");
    wsSend("showIntro", "");
  });

  $("#stopIntroBtn").click(function() {
    $("#startIntroBtn").removeAttr("disabled");
    wsSend("hideIntro", "");
  });

  $("#introVolume").on("input", function() {
    var v = parseFloat($(this).val()) / 10;
    wsSend("setIntroVolume", v);
  });

  $("#pointsToTheLeft").click(function() {
    var points = parseFloat($(".pointsLeft").text()) + parseFloat($("#SumRes").text());
    wsSend("setLeftPoints", points);
  });

  $("#pointsToTheRight").click(function() {
    var points = parseFloat($(".pointsRight").text()) + parseFloat($("#SumRes").text());
    wsSend("setRightPoints", points);
  });

  $("#newLeftPoints").click(function() {
    wsSend("setLeftPoints", $("#mPunkteLeft").val());
  });

  $("#newRightPoints").click(function() {
    wsSend("setRightPoints", $("#mPunkteRight").val());
  });

});

function showQuestionsAsPrint() {
  var ges = '<ol>';
  for (var i = 0; i < fragen.length; i++) {
    ges += '<li>' + fragen[i]["frage"] + '</li>';
  }
  ges += '</ol>';
  $("#printDiv").html(ges);
}

function setLeftPoints(newPoints) {
  $(".pointsLeft").text(newPoints);
  $("#mPunkteLeft").val(newPoints);
  if (sounds && (display || serverSound)) {
    audio = new Audio('./sounds/zahlRichtig.mp3');
    audio.play();
  }
}

function setRightPoints(newPoints) {
  $(".pointsRight").text(newPoints);
  $("#mPunkteRight").val(newPoints);
  if (sounds && (display || serverSound)) {
    audio = new Audio('./sounds/zahlRichtig.mp3');
    audio.play();
  }
}

function startJeopardy() {
  if (sounds && (display || serverSound)) {
    jeopardy = new Audio('./sounds/jeopardy.mp3');
    jeopardy.volume = jeopardyVolume;
    jeopardy.play();
  }
}

function stopJeopardy() {
  if (jeopardy) {
    jeopardy.pause();
  }
}

function startSchweinchen() {
  $("#schweinchenImg").show();
  $("#answers").hide();
  if (sounds && (display || serverSound)) {
    schweinchen = new Audio('./sounds/schweinchen.wav');
    schweinchen.volume = schweinchenVolume;
    schweinchen.play();
  }
}

function stopSchweinchen() {
  var index = $("#questionsSelcet>option:selected").index();
  $("#questionsSelcet").val(index + 1);
  changeFrage();

  $("#schweinchenImg").hide();
  $("#answers").show();
  if (schweinchen) {
    schweinchen.pause();
  }
}

function hideIntro() {
  /*
  $(".noIntro").show();
  $(".intro").hide();
  */
  $(".noIntro").removeClass('hidden');
  $(".intro").addClass('hidden');
  if (intro) {
    intro.pause();
  }
}

function showIntro() {
  /*$(".noIntro").hide();
  $(".intro").show();*/
  $(".noIntro").addClass('hidden');
  $(".intro").removeClass('hidden');
  if (sounds && (display || serverSound)) {
    intro = new Audio('./sounds/intro.mp3');
    intro.volume = introVolume;
    intro.play();
  }
}

function fillFragenSelect() {
  $("#questionsSelcet").empty();
  for (var i = 0; i < fragen.length; i++) {
    $("#questionsSelcet").append('<option value="' + i + '">' + fragen[i]["kuerzel"] + '</option>');
  }
}

function setFrageIndex(index) {
  if (index >= 0 && index < $("#questionsSelcet").find("option").length) {
    $("#questionsSelcet").find("option").removeAttr("selected");
    $($("#questionsSelcet").find("option")[index]).prop("selected", "true");
  }
  if ($("#questionsSelcet>option:selected").index() == -1 && $("#questionsSelcet").find("option")[0])
    $($("#questionsSelcet").find("option")[0]).prop("selected", "true");

  changeFrage();
}

function changeFrage() {
  var index = $("#questionsSelcet>option:selected").index();
  wsSend("loadQuestion", index);
  wsSend("clearAllFailsBtn", "");
}

function loadQuestionToGui(index) {
  $("#schweinchenImg").hide();
  $("#answers").empty();
  if (index > -1) {
    $("#frageDiv").html("Frage: " + fragen[index]["frage"]);
    for (var i = 0; i < fragen[index]["antworten"].length; i++) {
      if (fragen[index]["antworten"][i]["antwort"] != "") {
        var oneLine = $('<div class="row">' +
          '<div class="nr col-sm-1">' + (i + 1) + '.</div>' +
          '<div class="answer col-sm-10"></div>' +
          '<div class="points col-sm-1"></div>' +
          '</div>');
        if (display) {
          oneLine.find(".answer").html("_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _");
          oneLine.find(".points").text("--");
        } else {
          oneLine.find(".answer").html('<span class="markOnHover">' + getAnswerString(fragen[index]["antworten"][i]["antwort"]) + '</span>');
          oneLine.find(".points").html('<span class="markOnHover">' + fragen[index]["antworten"][i]["anz"] + '</span>');
          (function() {
            var is = i;
            var frage = fragen[index];
            oneLine.find(".answer").click(function() {
              wsSend("setAnswer", is + "###" + frage["antworten"][is]["antwort"]);
            });
            oneLine.find(".points").click(function() {
              wsSend("setAnz", is + "###" + frage["antworten"][is]["anz"]);
            });
          })();
        }
        $("#answers").append(oneLine);
      }
    }
  }
  recalcSum();
}

function setAnswer(index, answer) {
  answer = getAnswerString(answer);
  console.log(answer);
  var el = $($("#answers").find(".answer")[index]);
  el.empty();
  if (sounds && (display || serverSound)) {
    audio = new Audio('./sounds/textRichtig.mp3');
    audio.play();
  }
  el.typed({
    strings: [answer],
    typeSpeed: 20
  });
}

function setAnz(index, nr) {
  var el = $($("#answers").find(".points")[index]);
  el.text(nr);
  if (sounds && (display || serverSound)) {
    audio = new Audio('./sounds/zahlRichtig.mp3');
    audio.play();
  }
  recalcSum();
}

function recalcSum() {
  var summe = 0;
  $.each($(".points"), function() {
    var val = $(this).text();
    if (val != "--" && val != "" && $(this).find("span").length < 1) {
      summe += parseInt(val);
    }
  });
  $("#SumRes").text(summe);
}

function getAnswerString(str) {
  var anz = str.length;
  if (anz % 2 == 0) {
    str += "_";
  }
  anz = str.length;
  // types after answer printed
  while (str.length < 30) {
    str += " _";
  }
  return str;
}

function fillFragenEditor() {
  $("#fragenListe").empty();
  for (var i = 0; i < fragen.length; i++) {
    addNewQuestion(fragen[i]);
  }
}

function loadQuestions() {
  wsSend("fileOp", "read###fragen.txt");
}

function saveQuestions() {
  var objToSave = [];
  $.each($("#fragenListe").find("li"), function() {
    var oneQ = {
      "frage": $(this).find(".questionIn").val(),
      "kuerzel": $(this).find(".questionKIn").val(),
      "antworten": []
    };
    $.each($(this).find(".antTr"), function() {
      oneQ["antworten"].push({
        "antwort": $(this).find(".antwortInp").val(),
        "anz": $(this).find(".anz").val()
      });
    });
    objToSave.push(oneQ);
  });
  var jsonQues = JSON.stringify(objToSave);
  jsonQues = btoa(jsonQues);
  wsSend("fileOp", "write###fragen.txt###" + jsonQues);
}

function addNewQuestion(frage) {
  var newQHtml = $('<li style="list-style-type: none; padding: 5px; border: 1px solid black; margin-right: 80px; position: relative;"><i style="cursor:pointer; position: absolute; right: 5px;" class="fa fa-trash-o trash"></i><table>' +
    '<tr>' +
    '<td>Frage:</td><td><input class="questionIn" type="text"></td>' +
    '</tr><tr>' +
    '<td>Kürzel:</td><td><input class="questionKIn" type="text"></td>' +
    '</tr><tr class="antTr">' +
    '<td>Antwort 1:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>' +
    '</tr><tr class="antTr">' +
    '<td>Antwort 2:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>' +
    '</tr><tr class="antTr">' +
    '<td>Antwort 3:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>' +
    '</tr><tr class="antTr">' +
    '<td>Antwort 4:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>' +
    '</tr><tr class="antTr">' +
    '<td>Antwort 5:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>' +
    '</tr><tr class="antTr">' +
    '<td>Antwort 6:</td><td><input class="antwortInp" type="text"><input class="anz" type="number" min="1" max="100"></td>' +
    '</tr><tr>' +
    '</table></li>');
  if (frage != null) {
    newQHtml.find(".questionIn").val(frage["frage"]);
    newQHtml.find(".questionKIn").val(frage["kuerzel"]);
    for (var i = 0; i < frage["antworten"].length; i++) {
      $(newQHtml.find(".antwortInp")[i]).val(frage["antworten"][i]["antwort"]);
      $(newQHtml.find(".anz")[i]).val(frage["antworten"][i]["anz"]);
    }
  }
  newQHtml.find(".trash").click(function() {
    $(this).parent("li").remove();
  });
  $("#fragenListe").append(newQHtml);
}
