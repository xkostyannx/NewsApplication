if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Работает
} else {
  alert('File API не поддерживается данным браузером');
}
id = 0;
function Element(name){
  this.tagname = name;
  this.level = 0;
  this.id = id;
  this.text;
  this.children= [];
  this.IsClicked =false;
  this.attributes = {};
  this.hasAttributes = function() {
      for( var key in this.attributes){
        return true;
      }
      return false;
    }
  this.delete = false;
  this.addChild = function(name){
    var last = new Element(name);
    last.id = ++id;
    last.level = this.level+1 ;
    this.children.push(last);
  }
}
window.ContextMenu = new Vue({
  el:"#contextMenu",
  methods:{
    addElement(){
      this.$emit('add')
    },
    deleteElement(){
      this.$emit('delete')
    }
  }
})

var treeView = new Element("Root"); 
treeView.IsClicked = true;


var contextMenu = document.getElementById('contextMenu');
window.onclick = hideContextMenu;
window.onkeydown = listenKeys;

function hideContextMenu () {
  contextMenu.style.display='none';
}
function listenKeys (){
  var keyCode = event.which || event.keyCode;
  if (keyCode == 27){
    hideContextMenu();
  }
}

Vue.component('node-element', {
  data: function(){
    return{
    }
  },
  template:`<div class="node-element">
            <div class="panel panel-info"  @click="firstAction"  v-on:contextmenu="showContextMenu" style="width:min-content; height:fit-content;margin-right:10px">
              <div v-bind:class="{clicked : nodeid.IsClicked}"  class=" panel-body panel-info">
                <slot></slot>
              </div>
            </div>
            <div class="panel panel-success" v-if="nodeid.hasAttributes()">
              <div style="padding:15px" class="attribute-text panel-heading ">Attributes</div>
              <div class="panel-body panel-sucsess" style="padding:5px;">
                <p v-for="(attribute,key) in nodeid.attributes">{{key}}:{{attribute}}</p>
              </div>
            </div>
            <div style="margin-left:4px;margin-right:10px" v-if="nodeid.text">
                <p style="margin:0 0 0px;">Node Text:</p>
                <p class="node-element-text">{{nodeid.text}}</p>
            </div>
            </div>`,
  props : ['nodeid'],
  methods: {
    firstAction(){
      this.$emit('clicked',this.nodeid);
    },
    showContextMenu(event){
      this.firstAction();
      contextMenu.style.display='block';
      contextMenu.style.left = event.clientX + 'px';
      contextMenu.style.top = event.clientY + 'px';
      event.preventDefault();
    }
  }
});

Vue.component('treeviewer',{
  data: function() {
    return {
      IsCollapsed: false,
    }
  },
  template:`<div v-if="treeid.delete != true" >
            <i class="ion-minus" @click="collapse" v-if="IsCollapsed==false"></i><i class="ion-plus" @click="collapse" v-else></i>
            <node-element v-on:clicked="isActive" :nodeid="treeid">{{treeid.tagname}}</node-element>
            <branch v-if="IsCollapsed==false" v-on:clicked="isActive" :nodechildren="treeid.children"></branch>
            </div>   
  `,
  props : ['treeid'],
  methods:{
    isActive(object) {
      this.$emit('changeid',object)
    },
    collapse() {
      this.IsCollapsed = !this.IsCollapsed;
  }
}
})


Vue.component('branch',{
  template: `<div class="branch">
  <treeviewer v-on:changeid="isActive" v-for="node in nodechildren" :key="node.id" :treeid="node"></treeviewer>
  </div>`,
  props : ['nodechildren'],
  methods:{
    isActive: function(object) {
      this.$emit('clicked',object)
    }
  }
})
new Vue({
  el:"#app",
  data:{
    textareatext: "",
    AttributeName: "",
    AttributeValue: "",
    tree : treeView,
    currentNode: treeView,
  },
  methods: {
    refreshBox (object) {
      tagname.focus();
      this.currentNode.IsClicked = false;
      this.currentNode = object;
      this.currentNode.IsClicked = true;
      this.treeout();
    },
    addElement() {  
      this.currentNode.addChild("");
      var length= this.currentNode.children.length;
      this.refreshBox(this.currentNode.children[length - 1]);
    },
    deleteElement() { 
      if (this.currentNode.id == 0) alert("Нельзя удалить корневой элемент");
      else this.currentNode.delete = true;
      this.treeout();
    },
    addAttribute() {
      this.currentNode.attributes[this.AttributeName] = this.AttributeValue;
      this.AttributeName="";
      this.AttributeValue="";
      this.refreshBox(this.currentNode);
    },

    tagger(currentNode,mode){
      var text = "", openbracket="<", attributes="";
      if (currentNode.attributes)
      {
        for (var key in currentNode.attributes)
          attributes += " "+key + "='" + currentNode.attributes[key]+"' "
      }
      if (currentNode.text) text = currentNode.text;
      if (mode == 2) {
        openbracket="</";
        text="";
        attributes="";
      }
      return  openbracket+currentNode.tagname+attributes+">" +text;
    },
    out(currentNode){
      var tab ='';
      for (var i=0;i<currentNode.level;i++) {
        tab += "\t";
      }
      this.textareatext+= tab+this.tagger(currentNode);  
      if(currentNode.children.length){
        if (currentNode.children[currentNode.children.length-1].delete != true) this.textareatext+= "\n";
        for(var i=0; i < currentNode.children.length; i++){
          if (currentNode.children[i].delete != true) {
            this.out(currentNode.children[i]);
            this.textareatext+= "\n" ;
            if (i+1 ==currentNode.children.length) this.textareatext+= tab ;
          }
        }
       }
      this.textareatext+=this.tagger(currentNode,2); 
    },
    treeout(){
      this.textareatext="";
      this.out(this.tree);
    },
    XmlDownload(){
      var type = 'data:application/octet-stream;base64, ';
      var text = this.textareatext;
      var base = btoa(text);
      var res = type + base;
      document.getElementById('test').href = res;
    }
},
  created() {
    ContextMenu.$on('add', this.addElement)
    ContextMenu.$on('delete', this.deleteElement)
    this.treeout();
  }
})