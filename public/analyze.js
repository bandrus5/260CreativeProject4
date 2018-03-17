function setdefaultoptions() {
    var defaults = ["badAdverbCheck", "sentenceLengthCheck", "repeatWordCheck"];
    for (var i = 0; i < defaults.length; i++) {
      document.getElementById(defaults[i]).checked = true;
    }
}

function parseWords(allWords) {
    var word = {
      value: "",
      marked: false,
      markedVal: 0
    };
    var sentence = {
      words: [],
      marked: false,
      markedVal: 0
    };
    var allInfo = {
      words: [],
      sentences: []
    }
    for (var i = 0; i < allWords.length; i++) {
      var c = allWords.charAt(i);
      if (c === '\n') {
        if (word.value.length > 0) {
          sentence.words.push(word);
        }
        sentence.words.push({
          value: "\n",
          marked: false,
          markedVal: 0
        });
        allInfo.words.push(word);
        allInfo.words.push({
          value: "\n",
          marked: false,
          markedVal: 0
        });
        word = {
          value: "",
          marked: false,
          markedVal: 0
        };
        allInfo.sentences.push(sentence);
        sentence = {
          words: [],
          marked: false,
          markedVal: 0
        }
        continue;
      }
      else if (c === ' ' || c === '\t') {
          if (word.value !== "") {
            sentence.words.push(word);
            allInfo.words.push(word);
            word = {
              value: "",
              marked: false,
              markedVal: 0
            };
          }
          continue;
      }
      else if (c === '.' || c === '!' || c === '?') {
          sentence.words.push(word);
          allInfo.words.push(word);
          sentence.words.push({
            value: c,
            marked: false,
            markedVal: 0
          });
          allInfo.sentences.push(sentence);
          sentence = {
            words: [],
            marked: false,
            markedVal: 0
          };
          word = {
            value: "",
            marked: false,
            markedVal: 0
          };
          continue;
      }
      else {
        word.value = word.value.concat(c);
      }
    }
    if (word.value.length > 0) {
      sentence.words.push(word);
    }
    if (sentence.words.length > 0) {
      allInfo.sentences.push(sentence);
    }
    return allInfo;
}

function pasteText(sentences) {
    results = "<p>";
    for (i in sentences) {
        sentence = sentences[i];
        if (sentence.marked) {
            results += "<span class=\"highlighted" + sentence.markedVal + "\">";
            for (j in sentence.words) {
              word = sentence.words[j];
              if ((word.value === '.' || word.value === '!' || word.value === '?') && (results.length > 3)) {
                  results = results.substring(0, results.length - 1);
              }
              if (word.value === '\n') {
                results += "</p><p>    ";
              }
              else if (word.marked) {
                results += "<span class=\"highlighted" + word.markedVal + "\">" + word.value + "</span> ";
              }
              else {
                results += word.value + " ";
              }
            }
            results += "</span>";
        }
        else {
            for (j in sentence.words) {
              word = sentence.words[j];
              if ((word.value === '.' || word.value === '!' || word.value === '?') && (results.length > 3)) {
                  results = results.substring(0, results.length - 1);
              }
              if (word.value === '\n') {
                results += "</p><p>";
              }
              if (word.marked) {
                results += "<span class=\"highlighted" + word.markedVal + "\">" + word.value + "</span> ";
              }
              else {
                results += word.value + " ";
              }
            }
        }
    }
    results += "</p>";
    $("#outputarea").html(results);

}

function checkSentenceLength(sentences) {
    if (!$('#sentenceLengthCheck').is(':checked')) {
      return;
    }
    for (var i = 1; i < sentences.length - 1; i++) {
       if (sentences[i].words.length === sentences[i-1].words.length && sentences[i].words.length === sentences[i+1].words.length
       && sentences[i].words.length > 2) {
          sentences[i].marked = true;
          sentences[i].markedVal = 101;
          sentences[i-1].marked = true;
          sentences[i-1].markedVal = 101;
          sentences[i+1].marked = true;
          sentences[i+1].markedVal = 101;
       }
    }
}

function checkFirstWords(sentences) {
  if (!$('#repeatWordCheck').is(':checked')) {
    return;
  }
  for (var i = 1; i < sentences.length; i++) {
     if (sentences[i].words[0].value.toLowerCase() === sentences[i-1].words[0].value.toLowerCase()) {
        sentences[i].words[0].marked = true;
        sentences[i].words[0].markedVal = 102;
        sentences[i-1].words[0].marked = true;
        sentences[i-1].words[0].markedVal = 102;
     }
  }
}

function findTroubleWord(words, value, num) {
  words.forEach(function(element) {
      if(element.value.toLowerCase() === value.toLowerCase()) {
          element.marked = true;
          element.markedVal = num;
      }
  });
}

function findBang(words) {
  if (!$('#bangCheck').is(':checked')) {
    return;
  }
  words.forEach(function(element) {
      if(element.value.includes("!")) {
        element.marked = true;
        element.markedVal = 6;
      }
  });
}

function findAdverbs(words, sentences) {
  if (!$('#badAdverbCheck').is(':checked')) {
    return;
  }
  var lyWords = [];
  var currentLyIndex = 0;
  for (var i = 0; i < words.length; i++) {
      var word = words[i];
      if (word.value.endsWith("ly")) {
           lyWords.push(word);
           var thisIndex = i;
           $.ajax({
           type : "GET",
           url : "https://wordsapiv1.p.mashape.com/words/" + words[thisIndex].value + "/definitions",
           headers: {"X-Mashape-Key": "8HXj2NNzKGmshlvmsSxIoHzgJ4NKp12ajddjsnyPge7H9FIMc8", "X-Mashape-Host": "wordsapiv1.p.mashape.com"},
           datatype: "json",
           success : function(result) {
              for (var j = 0; j < result.definitions.length; j++) {
                 if (result.definitions[j].partOfSpeech === "adverb") {
                    lyWords[currentLyIndex].marked = true;
                    if (lyWords[currentLyIndex].markedVal == 102 || lyWords[currentLyIndex].markedVal == 104) {
                       lyWords[currentLyIndex].markedVal = 104;
                    }
                    else {
                       lyWords[currentLyIndex].markedVal = 4;
                    }
                 }
               }
               pasteText(sentences);
               currentLyIndex++;
           },
           error : function(result) {
             console.log("Could not find word: " + words[i]);
              currentLyIndex++;
           }
         });
      }
  }
  pasteText(sentences);
}


/*
function findPassiveVoice(sentences) {
  if (!$('#passiveCheck').is(':checked')) {
    return;
  }
  sentenceSpots = [];
  wordSpots = [];
  currentIndex = 0;
  toBeList = ["been", "be", "being", "am", "are", "is", "was", "were"];
  for (var i = 0; i < sentences.length; i++) {
      for (var j = 0; j < sentences[i].words.length; j++) {
          if ($.inArray(sentences[i].words[j].value.toLowerCase(), toBeList) >= 0) {
              console.log("Found value: " + sentences[i].words[j].value);
              sentenceSpots.push(i);
              wordSpots.push(j);
              var str = sentences[sentenceSpots[currentIndex]].words[wordSpots[currentIndex] + 1].value;
              console.log(str);
              $.ajax({
              type : "GET",
              url : "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/" + str,
              headers: {"Accept": "application/json", "app_id": "542d60fb", "app_key": "5e7ec46072c679c9a58e0c7e7412a6c0"},
              datatype: "json",
              success : function(result) {
                console.log("Successfully found word!");
                  // if (/* response has length > 0 ) {
                  //    sentences[sentenceSpots[currentIndex]].words[wordSpots[currentIndex] + 1].marked = true;
                  //    sentences[sentenceSpots[currentIndex]].words[wordSpots[currentIndex] + 1].markedVal = 103;
                  //    sentences[sentenceSpots[currentIndex]].words[wordSpots[currentIndex]].marked = true;
                  //    sentences[sentenceSpots[currentIndex]].words[wordSpots[currentIndex]].markedVal = 103;
                  // }
                  pasteText(sentences);
                  currentIndex++;
              },
              error : function(result) {
                 console.log("Could not find word: " + sentences[sentenceSpots[currentIndex]].words[wordSpots[currentIndex] + 1].value);
                 currentIndex++;
              }
            });
          }
      }
  }
}
*/

function analyze() {
    var allwords = document.getElementById("maintextarea").value;
    document.getElementById("inputarea").style.display = "none";
    document.getElementById("goback").style.display = "block";
    $(function(){
      $("input.form-check-input").attr("disabled", true);
      $("#addWordButton").attr("disabled", true);
    });
    $(function(){
      $("button.demoButton").attr("disabled", true);
    });
    var words;
    var sentences;
    var allInfo = parseWords(allwords);
    words = allInfo.words;
    sentences = allInfo.sentences;

    checkSentenceLength(sentences);
    checkFirstWords(sentences);
    findAdverbs(words, sentences);
    app.checkWords(words);
    //findPassiveVoice(sentences);
    pasteText(sentences);
}


function goBack() {
  document.getElementById("inputarea").style.display = "block";
  //document.getElementById("outputarea").style.display = "none";
  $("#outputarea").html("");
  document.getElementById("goback").style.display = "none";
  $(function(){
    $("input.form-check-input").attr("disabled", false);
    $("#addWordButton").attr("disabled", false);
  });
  $(function(){
    $("button.demoButton").attr("disabled", false);
  });
}


var app = new Vue({
  el: '#app',
  data: {
    title: 'The Style Helper',
    blurb: 'A dream come true for authors and editors alike.',
    stories: [],
    troubleWords: [],
    nextWord: '',
    currentlyDisplayed: null,
  },
  created: function() {
    axios.post('/api/stories', {
       name: "Eragon by Cristopher Paoloni",
       text: eragonText,
     }).then(response => {
       return true;
   }).catch(err => {
   });
   axios.post('/api/stories', {
      name: "Uncovered by Berkeley Andrus",
      text: uncoveredText,
    }).then(response => {
      return true;
  }).catch(err => {
  });
    this.getStories();
  },
  methods: {
    addStory: function(story) {
      this.currentlyDisplayed = story;
      document.getElementById("storytitle").value = story.name;
      document.getElementById("maintextarea").value = story.text;
    },
    appAnalyze: function() {
      analyze();
    },
    getStories: function() {
      axios.get("/api/stories").then(response => {
      	this.stories = response.data;
      	return true;
      }).catch(err => {
        console.log("An error occurred with getStories");
      });
    },
    saveStory: function() {
      axios.post('/api/stories', {
         name: document.getElementById("storytitle").value,
         text: document.getElementById("maintextarea").value,
       }).then(response => {
         this.currentlyDisplayed = response.data;
         this.getStories();
         return true;
     }).catch(err => {
     });
    },
    appGoBack: function() {
      goBack();
    },
    addWord: function() {
      if (this.nextWord.length === 0) {
        return;
      }
      this.troubleWords.push({text: this.nextWord, selected: true});
      this.nextWord = '';
    },
    deleteStory: function() {
      axios.delete("/api/stories/" + this.currentlyDisplayed.id).then(response => {
      this.getStories();
      this.currentlyDisplayed = null;
      document.getElementById("storytitle").value = "";
      document.getElementById("maintextarea").value = "";
      return true;
    }).catch(err => {
    });
    },
    toggleWordselected: function(word) {
      word.selected = !word.selected;
    },
    checkWords: function(words) {
      for (var i = 0; i < this.troubleWords.length; i++) {
        if (this.troubleWords[i].selected) {
          findTroubleWord(words, this.troubleWords[i].text, 1);
        }
      }
    },
    updateStory: function() {
      axios.put("/api/stories/" + this.currentlyDisplayed.id, {
       id: this.currentlyDisplayed.id,
       name: document.getElementById("storytitle").value,
       text: document.getElementById("maintextarea").value,
     }).then(response => {
       this.getStories();
       return true;
     }).catch(err => {
     });
    },
  }
})

var eragonText = "Wind howled through the night, carrying a scent that would change the world. A tall Shade lifted his head and sniffed the air. He looked human except for his crimson hair and maroon eyes."
 + "\nHe blinked in surprise. The message had been correct: they were here. Or was it a trap? He weighed the odds, then said icily, \"Spread out; hide behind trees and bushes. Stop whoever is coming . . . or die. \""
  + "\nAround him shuffled twelve Urgals with short swords and round iron shields painted with black symbols. They resembled men with bowed legs and thick, brutish arms made for crushing. A pair of twisted horns grew above their small ears. The monsters hurried into the brush, grunting as they hid. Soon the rustling quieted and the forest was silent again. "
  + "\n The Shade peered around a thick tree and looked up the trail. It was too dark for any human to see, but for him the faint moonlight was like sunshine streaming between the trees; every detail was clear and sharp to his searching gaze. He remained unnaturally quiet, a long pale sword in his hand. A wire-thin scratch curved down the blade. The weapon was thin enough to slip between a pair of ribs, yet stout enough to hack through the hardest armor."
  + "\nThe Urgals could not see as well as the Shade; they groped like blind beggars, fumbling with their weapons. An owl screeched, cutting through the silence. No one relaxed until the bird flew past. Then the monsters shivered in the cold night; one snapped a twig with his heavy boot. The Shade hissed in anger, and the Urgals shrank back, motionless. He suppressed his distaste they smelled like fetid meat and turned away. They were tools, nothing more."
  + "\nThe Shade forced back his impatience as the minutes became hours. The scent must have wafted far ahead of its owners. He did not let the Urgals get up or warm themselves. He denied himself those luxuries, too, and stayed behind the tree, watching the trail. Another gust of wind rushed through the forest. The smell was stronger this time. Excited, he lifted a thin lip in a snarl."
  + "\nGet ready, he whispered, his whole body vibrating. The tip of his sword moved in small circles. It had taken many plots and much pain to bring himself to this moment. It would not do to lose control now."
  + "\nEyes brightened under the Urgals thick brows, and the creatures gripped their weapons tighter. Ahead of them, the Shade heard a clink as something hard struck a loose stone. Faint smudges emerged from the darkness and advanced down the trail."
  + "\nThree white horses with riders cantered toward the ambush, their heads held high and proud, their coats rippling in the moonlight like liquid silver."
  + "\nOn the first horse was an elf with pointed ears and elegantly slanted eyebrows. His build was slim but strong, like a rapier. A powerful bow was slung on his back. A sword pressed against his side opposite a quiver of arrows fletched with swan feathers."
  + "\nThe last rider had the same fair face and angled features as the other. He carried a long spear in his right hand and a white dagger at his belt. A helm of extraordinary craftsmanship, wrought with amber and gold, rested on his head."
  + "\nBetween these two rode a raven-haired elven lady, who surveyed her surroundings with poise. Framed by long black locks, her deep eyes shone with a driving force. Her clothes were unadorned, yet her beauty was undiminished. At her side was a sword, and on her back a long bow with a quiver. She carried in her lap a pouch that she frequently looked at, as if to reassure herself that it was still there."
  + "\nThe band of fire thickened, contracting the area the Urgals had to search. Suddenly, the Shade heard shouts and a coarse scream. Through the trees he saw three of his charges fall in a pile, mortally wounded. He caught a glimpse of the elf running from the remaining Urgals."
  + "\nShe fled toward the craggy piece of granite at a tremendous speed. The Shade examined the ground twenty feet below, then jumped and landed nimbly in front of her. She skidded around and sped back to the trail. Black Urgal blood dripped from her sword, staining the pouch in her hand."
  + "\nThe horned monsters came out of the forest and hemmed her in, blocking the only escape routes. Her head whipped around as she tried to find a way out. Seeing none, she drew herself up with regal disdain. The Shade approached her with a raised hand, allowing himself to enjoy her helplessness."
  + "\nGet her."
  + "\nAs the Urgals surged forward, the elf pulled open the pouch, reached into it, and then let it drop to the ground. In her hands was a large sapphire stone that reflected the angry light of the fires. She raised it over her head, lips forming frantic words. Desperate, the Shade barked, Garjzla!"
  + "\nA ball of red flame sprang from his hand and flew toward the elf, fast as an arrow. But he was too late. A flash of emerald light briefly illuminated the forest, and the stone vanished. Then the red fire smote her and she collapsed."
  + "\nThe Shade howled in rage and stalked forward, flinging his sword at a tree. It passed halfway through the trunk, where it stuck, quivering. He shot nine bolts of energy from his palm which killed the Urgals instantly then ripped his sword free and strode to the elf."
  + "\nProphecies of revenge, spoken in a wretched language only he knew, rolled from his tongue. He clenched his thin hands and glared at the sky. The cold stars stared back, unwinking, otherworldly watchers. Disgust curled his lip before he turned back to the unconscious elf."
  + "\nHer beauty, which would have entranced any mortal man, held no charm for him. He confirmed that the stone was gone, then retrieved his horse from its hiding place among the trees. After tying the elf onto the saddle, he mounted the charger and made his way out of the woods."
  + "\nHe quenched the fires in his path but left the rest to burn. ";

var uncoveredText = "Stroke hefted a small knife in her hand. It was heavy and stout, made to be more durable than sharp. She couldn’t remember if she had stolen this particular one or purchased it, but it was likely the former. Knives this good were not cheap."
	+ "\nShe fixed her eyes on a target—a piece of abandoned drywall leaned up against some pallets—and tossed the knife with a casual flick of her wrist. It hit with a satisfying thud, sinking into the target all the way to the hilt. Her mouth curved in a satisfied smile. "
	+ "\nThe target was one of several she had set up on the roof of a mostly abandoned apartment building in South Haven. The building was perfect for her needs: short enough for her to get on top of, but tall enough to hide her from passers-by. It was falling to pieces in places, so that any sane person would rather sleep on the street than inside. That didn’t mean it was empty. Just mostly empty."
  + "\nSouth Haven had been her home for two years, ever since she had left East Haven. East Haven was known for its orphanages, South Haven for its criminal activity."
  + "\nShe was moving up in the world."
  + "\nStroke reached out with her mind, imagining the various weapons that were strapped to her legs, hidden under a pair of baggy, forest-green pants. The pressed against her skin with a comforting presence. She selected another knife, small and sturdy like the one she had just thrown. She let it fill her mind until it felt she could perceive every molecule of it."
  + "\nThen she Blinked it."
  + "\nBlinking was faster now that it had been two years ago. Back then it had been a mental strain that left her disoriented and weak. Now it was second nature."
  + "\nThe knife she had selected and imagined disappeared from its strap on her leg and appeared in her hand less than a heartbeat later."
  + "\nShe picked another target—an old car tire—and tossed the second knife. It missed the mark by an inch, hitting the metal center instead of the rubber exterior. It bounced off the tire and clattered sadly to the floor."
  + "\nStroke sighed, then walked over and picked up the knife. She threw it at the tire again, this time from an arm’s length away, and sunk it easily into the rubber."
  + "\n“That’s better,” she said to herself. She stooped and touched the knife with an index finger, Blinking it back into its strap. She stalked over to the first knife and Blinked it into its spot as well."
    + "\nShe spent the next ten minutes repeating the routine, throwing two or three knives at a time before collecting them again. She had six knives in total, and she took turns with each of them. Each knife was unique, and she wanted to know each of them as well as she could."
   + "\nNext, she trained with a small baton. She preferred a full staff in a fight, but batons were more practical. Hers collapsed to the length of her calf, so it fit nicely against her lower leg. After Blinking it to her hands, she extended it to almost the length of her arm."
  + "\nShe swung it around in a series of warm up exercises, letting her body catch up to her mind. Around and around it went, following perfect arcs that she had honed since her days in the orphanage. The movements were efficient and direct, maximizing the force of her blows without putting stress on her shoulders or elbows."
  + "\nIt was a cool evening, but the sticky humidity of the polluted South Haven air made the weather feel worse than it was. Soon her forehead was slick with beads of sweat, and she found herself dabbing at it with the short sleeves of her shirt. This was not even supposed to be her exercise for the day—that had been her morning jog—but she didn’t mind the strain. It felt good to be working. Improving. Preparing."
  + "\nOnce her body was loose, she stepped up to a sparring dummy she had set up on the roof. It was the size and shape of a person and made of a rubber-like material she could not identify. It was far too valuable to use for knife-throwing practice, but it was perfect with the baton."
  + "\nShe began beating the dummy with the baton, improvising combinations of blows that would be swift and painful in a fight. Some of the moves focused on force, others on speed. She put herself in a defensive mindset, then in an offensive one."
  + "\nWhap. Whap. Whap-whap. Temple. Gut. Shoulder—chin. Whap. Whap."
  + "\nThe exercise was hypnotic, and after a minute of work she no longer had to think about what she was doing. Her mind wandered, and she was no longer beating a prop. She remembered real fights, with real enemies. Victories. Defeats."
  + "\nShe remembered hearing the police sirens, smelling the smoke in the air."
  + "\n“Come on Stroke! We have to go! They’re coming!”"
  + "\nWhap. Whap-whap-whap. Knee—Crotch. Nose—Neck."
  + "\nIt would never happen again."
  + "\nStroke dropped the baton and fell to her knees, panting heavily. She had not realized how hard she had worked herself. She cursed at herself for not bringing water. Even with her ponytail, her red hair clung uncomfortably to her face, glued in place by her sweat and the damp air. She brushed it away impatiently."
  + "\n“Maybe that’s enough for today,” she whispered."
  + "\nShe stood up again and Blinked her baton to its holster on her leg. All her knives were already in their places, and she hadn’t brought anything else with her. She gave a satisfied nod, then turned to leave."
  + "\nAt the edge of the roof sat a coil of rope, tied securely on one end to the remains of a fire escape. The ladder itself had been stolen ages ago, but the top was still a secure mount. She grabbed the rope, tossed it over the edge of the roof, and began climbing the three stories to the ground."
  + "\nThe rope was one of her most valuable possessions. It was thin enough to store easily, strong enough to hold her, and soft enough to climb comfortably. She climbed down quickly, hoping no one would see her. While no one really policed the Havens, she still didn’t want to draw attention. Soon she was on the ground, her feet planted firmly on the sidewalk."
  + "\nShe held the rope in one hand and, after several moments of intense concentration, Blinked it under her shirt. Ropes were hard, as she had to imagine both where they started and where they ended up, but she enjoyed the practice. After months of training, she could Blink ropes into knots and coils even easier than she could arrange them with her hands."
  + "\nOnce the rope was in place, coiled in a circle on her back, she took off down the street at a brisk walk. She didn’t have any other responsibilities for the day, but she was so used to urgency that she had a hard time walking at a normal pace."
  + "\nThe buildings she passed were much like the one she trained on. They were different sizes, but almost all of them were apartment buildings in various states of disrepair. Occasionally she passed small convenience stores, but setting up shop in the Havens brought more risks than opportunities. Especially South Haven. She suspected that some of the stores got more shoplifters than customers."
  + "\nSome of the apartments were nicer than others. Those were the ones with paint that only peeled at the corners and windows that were dirty instead of shattered. Many were marked with the symbols of their resident gangs, but Stroke didn’t worry about those. The gangs either knew her personally or knew who she was, and they knew what would happen if they tried to bar her entry to their territory."
  + "\nThe sun was just beginning to go down when she reached her destination. The nicest building in all of South Haven."
  + "\nIt was her home. For now."
  + "\nThe apartment building was distinct from its neighbors. It was a story taller than any other in South Haven, and it was the only building not covered with graffiti. The team Stroke had joined didn’t need tags to defend their territory from encroaching neighbors. Their reputation was protection enough."
  + "\nStroke nodded to the man standing guard outside as she approached."
  + "\n“How was the workout?” he asked her. He was in his early twenties, the same age as Stroke, and wore a red cap over his dark curly hair. He was one of the newer recruits to the team."
  + "\n“Good,” Stroke said. “I’m getting better with the knives.”"
  + "\nThe man nodded. “You’re always getting better at something. I don’t know how you manage to get so much practice in.”"
  + "\nStroke didn’t react to the compliment."
  + "\n“Any news here?” she asked."
  + "\n“Not much. Patron got back a little while after you left. He didn’t seem like he’s in a very good mood.”"
  + "\nStroke rolled her eyes. Patron was never in a good mood."
  + "\n“Do you need a shift change any time soon?” she asked. “I’m free for a few hours.”"
  + "\nThe man shook his head. “Nah, I’m fine. You go relax.”"
  + "\nStroke clenched a fist."
  + "\nRelax."
  + "\nShe hated that word. Relaxing was how people got killed."
  + "\n“Let me know if you change your mind,” she said."
  + "\nWithout waiting for a reply, she strode into the building."
  + "\nInside was even nicer than the outside, at least by South Haven terms. Patron, their leader, ran a tight operation, and he made sure the rooms and hallways were always clean. The carpets were as clean as they could be with all the traffic they got, and the white painted walls had only a few dings and streaks. Patron had even brought in some modest paintings to hang on the walls. He had always disdained the poverty of the Havens, as though in denial that he lived in one. The artwork was none of the small ways he lied to himself."
  + "\nStroke paced down the hallway, passing a couple of other Haveners on her way. They each nodded respectfully towards her, and she nodded back."
  + "\nShe climbed a staircase at the end of the hallway, passing the second floor and coming up to the third. Her room was on the fourth floor, but she had several visits to make before she could retire for the night."
  + "\nMost of the floors on the building, including the third floor, was filled with small bedrooms connected by winding hallways. The ground floor was the exception. It held only two rooms, one that they used for a cafeteria and one that they used for a gym. Stroke wove her way through several twists and turns, then came to the door she was looking for. She knocked solidly on it and waited."
  + "\nA moment later, Beta opened the door."
  + "\n“Yes?” he asked, looking up at her. He was a short dark-skinned man, a little on the heavy side, and with thick glasses that seemed to dominate his face. Behind him, his bedroom hummed with the sound of a half dozen computers whirring."
  + "\n“Can I come in?” Stroke asked."
  + "\n“Of course.” Beta stepped back from the doorway and ushered her through."
  + "\nThe room was on the building’s interior and didn’t have any windows. Stroke flicked the lights on as she walked in, making Beta flinch against the sudden brightness."
  + "\n“Working in the dark again?” she asked him."
  + "\nBeta frowned and adjusted his glasses. “Yes. It makes it easier to see.”"
  + "\nStroke looked around at the array of computer monitors he had set up on and around his desk. She wondered how he managed to fit so many devices into such a small room. Even his bed was covered with cables and screens."
  + "\nBeta sat down in a chair and began typing on a keyboard. From the looks of things, Stroke had interrupted one of his big projects. That was no surprise, though. Beta was always in the middle of something big."
  + "\n“Give me just a minute,” Beta said as he typed. “There was a possible breach of somebody’s phone. I want to trace the attack before I lock it down.”"
  + "\nStroke waited patiently as Beta typed away. Occasionally he would whisper to his computer like a mother talking to her child. She had to stifle a smile whenever that happened."
  + "\nFinally he closed the window he was working in and turned to face her."
  + "\n“Okay. What’s up?”"
  + "\n“I was hoping you had another assignment for me,” she said. “I’m sick of South Haven. I’m ready for some more action.”"
  + "\nBeta threw his hands in the air. “Why does everyone think I know what’s going on?” he asked. “Patron doesn’t tell me anything.”"
  + "\nStroke smiled. “That’s because you usually know stuff before Patron does. If anything, you should be briefing him.”"
  + "\nBeta rolled his eyes, then spun in his chair back towards the computers."
  + "\n“I’ll see what I’ve got,” he said. “But I can’t promise anything. We haven’t had many potential recruits lately.”"
  + "\nStroke frowned. “Haven’t you been tracking Pavilion? I thought that was supposed to be a huge breakthrough.”"
  + "\nBeta nodded without looking at her. “Yeah, that didn’t turn out like we thought. They’ve been remarkably boring for months. I think they’re as stuck as we are. Okay, here’s something.”"
  + "\nBeta pulled up a file on his computer screen, and Stroke leaned in to look at it."
  + "\n“Reconnaissance?” Stroke asked doubtfully. “That’s it? You don’t have any actual contacts?”"
  + "\nBeta shrugged as he adjusted his glasses again. “Like I said, we haven’t had many recruits lately. Patron thinks we might have located almost all of them by now.”"
  + "\n“Except the ones Pavilion got to first,” Stroke said sourly. “What’s the kid’s name?”"
  + "\n“Dirtona,” Beta said, scrolling through the file. “He’s a student in New Scathis. Not a super likely candidate, but enough to be of interest. We’ll want to see if he’s actually one of us before we send an full recruitment team.”"
  + "\nStroke sighed. “Fine, I’ll do it.”"
  + "\nBeta looked back at her, a sly look on his face."
  + "\n“It’ll probably take a couple days,” he said slowly. “We don’t have a lot of reliable intel on him.”"
  + "\nStroke narrowed her eyes. “So?”"
  + "\n“I just wonder,” Beta said. “Would you want to be away from Crest for that long?”"
  + "\nStroke scowled. “I don’t know what you’re talking about.”"
  + "\n“Ha.” Beta grinned at her. “We’ve all seen how you look at each other. What are you waiting for?”"
  + "\nStroke’s scowl relaxed, but she kept her eyebrows furrowed."
  + "\n“You know it wouldn’t work,” she said."
  + "\n“Why not?”"
  + "\nShe searched for the right words."
  + "\n“It’s just...we’re at war. Every day matters. Every hour. I can’t waste time when I could be out protecting people from Pavilion.”"
  + "\nBeta rubbed his chin thoughtfully."
  + "\n	“Is happiness a waste of time?” he asked."
  + "\nStroke hesitated."
  + "\nWas it?"
  + "\n“Hopefully one day it won’t be,” she finally said. “Once we’ve won.”"
  + "\nBeta shrugged. “It’s up to you. I’m just saying that you’re missing out.”"
  + "\nStroke grunted. “As if you know anything about romance.”"
  + "\n“I know plenty!” Beta threw his arms around the nearest computer and began caressing it mockingly. “I’ve got all the love I need right here.”"
  + "\nStroke laughed. “You really should get out more.”"
  + "\nShe stepped towards the door."
  + "\n“I’ll send you a copy of Dirtona’s file,” Beta said. “Good luck in New Scathis.”"
  + "\n“Thanks,” Stroke said. “See you later.”"
  + "\nShe left the room, then headed back down the hallway the way she had come. When she reached the stairs, she climbed up past her own floor. She went all the way to the fifth and final floor of the building."
  + "\nThis level was quieter than the others. Everywhere in the Havener’s building there were signs of business. People rushing around, tools or equipment leaning against walls. But here, things were still."
  + "\nThere were a few bedrooms on this floor, but most were unoccupied. In fact, Stroke had only ever been in one. The one Patron used as an office."
  + "\nShe walked up to his door and knocked."
  + "\n“Come in,” said a deep voice from inside."
  + "\nStroke opened the door. The room was a stark contrast to Beta’s messy abode. This was the biggest room on the floor, and was well lit with lamps. The last rays of the sunset shone through the window, casting a red and pink glow on everything. Maps of Mutain covered one wall, while the other was lined with bookshelves."
  + "\nIn the middle of the room was a large wooden desk, behind which Patron sat watching her. He was in his sixties, with thin gray hair and a hard face. His eyes and cheeks were sunken in, and his pale lips were pressed in a thin line."
  + "\n“Yes?” he asked softly."
  + "\nStroke closed the door and sat at the hard wooden chair on her side of the mahogany desk."
  + "\n“Beta found another possible recruit. I was hoping I could go try to contact him.”"
  + "\nPatron leaned forward in his chair."
  + "\n“What are the boy’s powers?” he asked."
  + "\n“Um...we’re not sure if he has powers or not,” Stroke confessed. “That’s what I was going to try to find out.”"
  + "\nPatron nodded, as though he had been expecting this answer."
  + "\n“Where is he located?”"
  + "\n“New Scathis, sir,” Stroke said."
  + "\n“How will you get there?”"
  + "\nStroke sighed. Patron always seemed to jump to the problems in her plans."
  + "\n“I was hoping to borrow one of the cars. I can take the bus though, if I need to.”"
  + "\nPatron frowned. “Lukar is taking one of the cars tomorrow, and I need the other. The third is still being repaired. I’m afraid that will be impossible.”"
  + "\n“The bus it is, then,” Stroke said flatly."
  + "\nPatron sighed, as though the conversation was wearying him. “How long will you be gone?”"
  + "\n“Two days,” Stroke said hurriedly. It would probably end up being three, but she didn’t want to admit that."
  + "\nPatron arched an eyebrow."
  + "\n“Will that be enough time?” he asked."
  + "\nStroke nodded firmly. “I can do it.”"
  + "\nFinally, Patron relaxed."
  + "\n“Fine, you can go. Report to me when you return.”"
  + "\nStroke stood up stiffly."
  + "\n“Thank you, sir. I’ll let you know how it goes.”";
