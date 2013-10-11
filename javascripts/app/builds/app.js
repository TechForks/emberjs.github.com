var App=Ember.Application.create({rootElement:"#builds-application"});App.Router.map(function(){this.resource("release",function(){this.route("latest"),this.route("daily")}),this.resource("beta",function(){this.route("latest"),this.route("daily")}),this.resource("canary",function(){this.route("latest"),this.route("daily")}),this.route("tagged")}),App.CopyClipboardComponent=Ember.Component.extend({tagName:"span",hasFlash:ZeroClipboard.detectFlashSupport(),didInsertElement:function(){var e=new ZeroClipboard(this.$("button"),{moviePath:"/images/ZeroClipboard.swf",trustedDomains:["*"],allowScriptAccess:"always"});e.on("mousedown",function(e,t){Em.run.later(this,function(){$(this).removeClass("loading"),$(this).removeAttr("disabled")},1e3),Em.run.next(this,function(){$(this).addClass("loading"),$(this).attr("disabled","disabled")})}),this.$("input").on("click",function(){$(this).select()})}}),App.S3Bucket=Ember.Object.extend({files:[],isLoading:!1,queryUseSSL:!0,objectUseSSL:!1,delimiter:"/",bucket:"builds.emberjs.com",endpoint:"s3.amazonaws.com",delimiterParameter:function(){var e=this.getWithDefault("delimiter","").toString();return e?"delimiter="+e:""}.property("delimiter"),markerParameter:function(){return"marker="+this.getWithDefault("marker","").toString()}.property("marker"),maxKeysParameter:function(){return"max-keys="+this.getWithDefault("maxKeys","").toString()}.property("maxKeys"),prefixParameter:function(){return"prefix="+this.getWithDefault("prefix","").toString()}.property("prefix"),queryProtocol:function(){return this.get("queryUseSSL")?"https://":"http://"}.property("queryUseSSL"),queryBaseUrl:function(){return this.get("queryProtocol")+this.get("endpoint")+"/"+this.get("bucket")}.property("queryProtocol","endpoint","bucket"),objectProtocol:function(){return this.get("objectUseSSL")?"https://":"http://"}.property("objectUseSSL"),objectBaseUrl:function(){return this.get("objectProtocol")+this.get("bucket")}.property("objectProtocol","bucket"),queryParams:function(){return this.get("delimiterParameter")+"&"+this.get("markerParameter")+"&"+this.get("maxKeysParameter")+"&"+this.get("prefixParameter")}.property("delimiterParameter","markerParameter","maxKeysParameter","prefixParameter"),queryUrl:function(){return this.get("queryBaseUrl")+"?"+this.get("queryParams")}.property("queryBaseUrl","queryParams"),filesPresent:function(){return this.get("files").length}.property("files.@each"),filterFiles:function(e){var t=this.get("files");return t.filter(function(t){return t.get("name").indexOf(e+".")!==-1})},load:function(){var e=this,t=this.get("objectBaseUrl");this.set("isLoading",!0),Ember.$.get(this.get("queryUrl"),function(n){e.set("isLoading",!1),e.set("response",n);var r=n.getElementsByTagName("Contents"),i=r.length,s=[];for(var o=0;o<i;o++){var u=r[o].getElementsByTagName("Size")[0].firstChild.data,a=r[o].getElementsByTagName("Key")[0].firstChild.data,f=new Date(r[o].getElementsByTagName("LastModified")[0].firstChild.data);s.push(App.S3File.create({name:a,size:u,lastModified:f,relativePath:a,baseUrl:t}))}e.set("files",s.sort(function(e,t){return t.lastModified-e.lastModified}))})}.observes("queryUrl").on("init")}),App.S3File=Ember.Object.extend({scriptTag:function(){var e=Handlebars.Utils.escapeExpression(this.get("url"));return(new Handlebars.SafeString('<script src="'+e+'"></script>')).toString()}.property("url"),url:function(){return this.get("baseUrl")+"/"+this.get("relativePath")}.property("baseUrl","relativePath")}),App.Project=Ember.Object.extend(),App.Project.reopenClass({FIXTURES:[{projectName:"Ember",projectFilter:"ember",projectRepo:"emberjs/ember.js",channel:"tagged"},{projectName:"Ember Data",projectFilter:"ember-data",projectRepo:"emberjs/data",channel:"tagged"},{projectName:"Ember",projectFilter:"ember",projectRepo:"emberjs/ember.js",lastRelease:"1.0.0",futureVersion:"1.0.1",channel:"release",date:"2013-08-31"},{projectName:"Ember",projectFilter:"ember",projectRepo:"emberjs/ember.js",lastRelease:"1.1.0-beta.4",futureVersion:"1.1.0",changelog:"false",channel:"beta",date:"2013-09-28"},{projectName:"Ember Data",projectFilter:"ember-data",projectRepo:"emberjs/data",lastRelease:"1.0.0-beta.3",futureVersion:"1.0.0-beta.4",channel:"beta",date:"2013-09-28"},{projectName:"Ember",projectFilter:"ember",projectRepo:"emberjs/ember.js",channel:"canary"},{projectName:"Ember Data",projectFilter:"ember-data",projectRepo:"emberjs/data",channel:"canary"}],all:function(e){var t;return e?t=this.FIXTURES.filterBy("channel",e):t=this.FIXTURES,t.map(function(e){return App.Project.create(e)})},find:function(e,t){var n=this.all(e);return t?n.filterBy("name",t):n}}),App.BetaRoute=Ember.Route.extend({redirect:function(){this.transitionTo("beta.latest")}}),App.BuildCategoryMixin=Ember.Mixin.create({renderTemplate:function(){this.render("build-list")}}),App.BetaLatestRoute=Ember.Route.extend(App.BuildCategoryMixin,{model:function(){return App.S3Bucket.create({title:"Beta Builds",prefix:"beta/"})}}),App.ApplicationController=Ember.ObjectController.extend({isIndexActive:function(){return this.isActiveChannel("index")}.property("currentRouteName"),isTaggedActive:function(){return this.isActiveChannel("tagged")}.property("currentRouteName"),isChannelsActive:function(){var e=this;return!["index","tagged"].some(function(t){return t===e.get("currentRouteName")})}.property("currentRouteName"),isReleaseActive:function(){return this.isActiveChannel("release")}.property("currentRouteName"),isBetaActive:function(){return this.isActiveChannel("beta")}.property("currentRouteName"),isCanaryActive:function(){return this.isActiveChannel("canary")}.property("currentRouteName"),isActiveChannel:function(e){return this.get("currentRouteName").indexOf(e)!==-1}}),App.CategoryLinkMixin=Ember.Mixin.create({channel:null,latestLink:function(){return this.get("channel")+".latest"}.property("channel"),dailyLink:function(){return this.get("channel")+".daily"}.property("channel")}),App.ProjectsMixin=Ember.Mixin.create({projects:function(){var e=App.Project.find(this.get("channel")),t=this.get("model"),n=this;return e.forEach(function(e){e.files=t.filterFiles(e.projectFilter),e.description=n.description(e),e.lastReleaseDebugUrl=n.lastReleaseUrl(e.projectFilter,e.channel,e.lastRelease,".js"),e.lastReleaseProdUrl=n.lastReleaseUrl(e.projectFilter,e.channel,e.lastRelease,".prod.js"),e.lastReleaseMinUrl=n.lastReleaseUrl(e.projectFilter,e.channel,e.lastRelease,".min.js"),e.channel==="canary"?e.lastRelease="latest":e.changelog!=="false"&&(e.lastReleaseChangelogUrl="https://github.com/"+e.projectRepo+"/blob/v"+e.lastRelease+"/CHANGELOG")}),e}.property("channel","model"),description:function(e){var t=e.lastRelease,n=e.futureVersion,r;return this.get("channel")==="tagged"?r="":t?r="The builds listed below are incremental improvements made since "+t+" and may become "+n+".":n?r="The builds listed below are not based on a tagged release. Upon the next release cycle they will become "+n+".":r="The builds listed below are based on the most recent development.",new Handlebars.SafeString(r)},lastReleaseUrl:function(e,t,n,r){return t==="canary"?"http://builds.emberjs.com/canary/"+e+r:"http://builds.emberjs.com/tags/v"+n+"/"+e+r}}),App.BetaLatestController=Ember.ObjectController.extend(App.ProjectsMixin,App.CategoryLinkMixin,{channel:"beta"}),App.BetaDailyRoute=Ember.Route.extend(App.BuildCategoryMixin,{model:function(){return App.S3Bucket.create({title:"Beta Builds",delimiter:"",prefix:"beta/daily",marker:"beta/daily/"+moment().subtract("days",14).format("YYYYMMDD")})}}),App.BetaDailyController=Ember.ObjectController.extend(App.ProjectsMixin,App.CategoryLinkMixin,{channel:"beta"}),App.CanaryRoute=Ember.Route.extend({redirect:function(){this.transitionTo("canary.latest")}}),App.CanaryLatestRoute=Ember.Route.extend(App.BuildCategoryMixin,{model:function(){return App.S3Bucket.create({title:"Canary Builds",prefix:"canary/"})}}),App.CanaryLatestController=Ember.ObjectController.extend(App.ProjectsMixin,App.CategoryLinkMixin,{channel:"canary"}),App.CanaryDailyRoute=Ember.Route.extend(App.BuildCategoryMixin,{model:function(){return App.S3Bucket.create({title:"Canary Builds",delimiter:"",prefix:"canary/daily",marker:"canary/daily/"+moment().subtract("days",14).format("YYYYMMDD")})}}),App.CanaryDailyController=Ember.ObjectController.extend(App.ProjectsMixin,App.CategoryLinkMixin,{channel:"canary"}),App.ReleaseRoute=Ember.Route.extend({redirect:function(){this.transitionTo("release.latest")}}),App.ReleaseLatestController=Ember.ObjectController.extend(App.ProjectsMixin,App.CategoryLinkMixin,{channel:"release"}),App.ReleaseLatestRoute=Ember.Route.extend(App.BuildCategoryMixin,{model:function(){return App.S3Bucket.create({title:"Release Builds",prefix:"release/"})}}),App.ReleaseDailyController=Ember.ObjectController.extend(App.ProjectsMixin,App.CategoryLinkMixin,{channel:"release"}),App.ReleaseDailyRoute=Ember.Route.extend(App.BuildCategoryMixin,{model:function(){return App.S3Bucket.create({title:"Release Builds",delimiter:"",prefix:"release/daily",marker:"release/daily/"+moment().subtract("days",14).format("YYYYMMDD")})}}),App.TaggedRoute=Ember.Route.extend({model:function(){var e=App.S3Bucket.create({title:"Tagged Release Builds",prefix:"tags/",delimiter:""});return e}}),App.TaggedController=Ember.ObjectController.extend(App.ProjectsMixin,{channel:"tagged"}),Ember.Handlebars.helper("format-bytes",function(e){return(e/1024).toFixed(2)+" KB"}),Ember.Handlebars.helper("format-date-time",function(e){return moment(e).fromNow()});