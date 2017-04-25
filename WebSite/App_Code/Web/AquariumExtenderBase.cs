using System;
using System.Data;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using Newtonsoft.Json.Linq;
using MyCompany.Data;
using MyCompany.Services;

namespace MyCompany.Web
{
	public class AquariumFieldEditorAttribute : Attribute
    {
    }
    
    public class AquariumExtenderBase : ExtenderControl
    {
        
        private string _clientComponentName;
        
        public static string DefaultServicePath = "~/_invoke";
        
        private string _servicePath;
        
        private SortedDictionary<string, object> _properties;
        
        private static bool _enableCombinedScript;
        
        [System.Diagnostics.DebuggerBrowsable(System.Diagnostics.DebuggerBrowsableState.Never)]
        private bool _ignoreCombinedScript;
        
        public AquariumExtenderBase(string clientComponentName)
        {
            this._clientComponentName = clientComponentName;
        }
        
        [System.ComponentModel.Description("A path to a data controller web service.")]
        [System.ComponentModel.DefaultValue("~/_invoke")]
        public virtual string ServicePath
        {
            get
            {
                if (String.IsNullOrEmpty(_servicePath))
                	return AquariumExtenderBase.DefaultServicePath;
                return _servicePath;
            }
            set
            {
                _servicePath = value;
            }
        }
        
        [System.ComponentModel.Browsable(false)]
        public SortedDictionary<string, object> Properties
        {
            get
            {
                if (_properties == null)
                	_properties = new SortedDictionary<string, object>();
                return _properties;
            }
        }
        
        public static bool EnableCombinedScript
        {
            get
            {
                return _enableCombinedScript;
            }
            set
            {
                _enableCombinedScript = value;
            }
        }
        
        public bool IgnoreCombinedScript
        {
            get
            {
                return this._ignoreCombinedScript;
            }
            set
            {
                this._ignoreCombinedScript = value;
            }
        }
        
        protected override System.Collections.Generic.IEnumerable<ScriptDescriptor> GetScriptDescriptors(Control targetControl)
        {
            if (Site != null)
            	return null;
            if (ScriptManager.GetCurrent(Page).IsInAsyncPostBack)
            {
                bool requireRegistration = false;
                Control c = this;
                while (!(requireRegistration) && ((c != null) && !((c is HtmlForm))))
                {
                    if (c is UpdatePanel)
                    	requireRegistration = true;
                    c = c.Parent;
                }
                if (!(requireRegistration))
                	return null;
            }
            ScriptBehaviorDescriptor descriptor = new ScriptBehaviorDescriptor(_clientComponentName, targetControl.ClientID);
            descriptor.AddProperty("id", this.ClientID);
            string baseUrl = ResolveClientUrl("~");
            if (baseUrl == "~")
            	baseUrl = String.Empty;
            bool isTouchUI = ApplicationServices.IsTouchClient;
            if (!(isTouchUI))
            {
                descriptor.AddProperty("baseUrl", baseUrl);
                descriptor.AddProperty("servicePath", ResolveClientUrl(ServicePath));
            }
            ConfigureDescriptor(descriptor);
            return new ScriptBehaviorDescriptor[] {
                    descriptor};
        }
        
        protected virtual void ConfigureDescriptor(ScriptBehaviorDescriptor descriptor)
        {
        }
        
        public static ScriptReference CreateScriptReference(string p)
        {
            CultureInfo culture = Thread.CurrentThread.CurrentUICulture;
            List<string> scripts = ((List<string>)(HttpRuntime.Cache["AllApplicationScripts"]));
            if (scripts == null)
            {
                scripts = new List<string>();
                string[] files = Directory.GetFiles(HttpContext.Current.Server.MapPath("~/Scripts"), "*.js");
                foreach (string script in files)
                {
                    Match m = Regex.Match(Path.GetFileName(script), "^(.+?)\\.(\\w\\w(\\-\\w+)*)\\.js$");
                    if (m.Success)
                    	scripts.Add(m.Value);
                }
                HttpRuntime.Cache["AllApplicationScripts"] = scripts;
            }
            if (scripts.Count > 0)
            {
                Match name = Regex.Match(p, "^(?\'Path\'.+\\/)(?\'Name\'.+?)\\.js$");
                if (name.Success)
                {
                    string test = String.Format("{0}.{1}.js", name.Groups["Name"].Value, culture.Name);
                    bool success = scripts.Contains(test);
                    if (!(success))
                    {
                        test = String.Format("{0}.{1}.js", name.Groups["Name"].Value, culture.Name.Substring(0, 2));
                        success = scripts.Contains(test);
                    }
                    if (success)
                    	p = (name.Groups["Path"].Value + test);
                }
            }
            p = (p + String.Format("?{0}", ApplicationServices.Version));
            return new ScriptReference(p);
        }
        
        protected override System.Collections.Generic.IEnumerable<ScriptReference> GetScriptReferences()
        {
            if (Site != null)
            	return null;
            if ((Page != null) && ScriptManager.GetCurrent(Page).IsInAsyncPostBack)
            	return null;
            List<ScriptReference> scripts = new List<ScriptReference>();
            if (EnableCombinedScript && !(IgnoreCombinedScript))
            	return scripts;
            bool isMobile = ApplicationServices.IsTouchClient;
            scripts.Add(CreateScriptReference("~/Scripts/_System.js"));
            if (isMobile)
            	scripts.Add(CreateScriptReference(String.Format("~/touch/jquery.mobile-{0}.min.js", ApplicationServices.JqmVersion)));
            scripts.Add(CreateScriptReference("~/Scripts/MicrosoftAjax.js"));
            if (!(isMobile))
            {
                scripts.Add(CreateScriptReference("~/Scripts/AjaxControlToolkit.js"));
                scripts.Add(CreateScriptReference("~/Scripts/MicrosoftAjaxWebForms.js"));
            }
            scripts.Add(CreateScriptReference("~/Scripts/daf-resources.js"));
            if (!(isMobile))
            	scripts.Add(CreateScriptReference("~/Scripts/daf-menu.js"));
            scripts.Add(CreateScriptReference("~/Scripts/daf.js"));
            if (!(isMobile) && new ControllerUtilities().SupportsScrollingInDataSheet)
            	scripts.Add(CreateScriptReference("~/Scripts/daf-extensions.js"));
            ConfigureScripts(scripts);
            if (isMobile)
            {
                scripts.Add(CreateScriptReference("~/Scripts/touch.js"));
                scripts.Add(CreateScriptReference("~/Scripts/touch-charts.js"));
            }
            if (Context.Request.Url.Host.Equals("localhost") && File.Exists(Context.Server.MapPath("~/Scripts/codeontime.designer.js")))
            	scripts.Add(CreateScriptReference("~/Scripts/codeontime.designer.js"));
            return scripts;
        }
        
        protected virtual void ConfigureScripts(List<ScriptReference> scripts)
        {
        }
        
        protected override void OnLoad(EventArgs e)
        {
            if (ScriptManager.GetCurrent(Page).IsInAsyncPostBack)
            	return;
            base.OnLoad(e);
            if (Site != null)
            	return;
            RegisterFrameworkSettings(Page);
        }
        
        public static void RegisterFrameworkSettings(Page p)
        {
            if (!(p.ClientScript.IsStartupScriptRegistered(typeof(AquariumExtenderBase), "TargetFramework")))
            {
                string designerPort = ApplicationServices.DesignerPort;
                if (!(String.IsNullOrEmpty(designerPort)) && !(Controller.UserIsInRole(ApplicationServices.SiteContentDevelopers)))
                	designerPort = String.Empty;
                p.ClientScript.RegisterStartupScript(typeof(AquariumExtenderBase), "TargetFramework", String.Format("var __targetFramework=\"4.6\",__tf=4.0,__servicePath=\"{0}\",__baseUrl=\"{1}\",__design" +
                            "erPort=\"{2}\";", p.ResolveClientUrl(AquariumExtenderBase.DefaultServicePath), p.ResolveClientUrl("~"), designerPort), true);
                p.ClientScript.RegisterStartupScript(typeof(AquariumExtenderBase), "TouchUI", (("var __settings=" + ApplicationServices.Create().UserSettings(p).ToString(Newtonsoft.Json.Formatting.None)) 
                                + ";"), true);
            }
        }
        
        public static List<ScriptReference> StandardScripts()
        {
            return StandardScripts(false);
        }
        
        public static List<ScriptReference> StandardScripts(bool ignoreCombinedScriptFlag)
        {
            AquariumExtenderBase extender = new AquariumExtenderBase(null);
            extender.IgnoreCombinedScript = ignoreCombinedScriptFlag;
            List<ScriptReference> list = new List<ScriptReference>();
            list.AddRange(extender.GetScriptReferences());
            return list;
        }
        
        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);
        }
    }
}
