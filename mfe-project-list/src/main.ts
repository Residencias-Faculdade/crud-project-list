import { createApplication } from "@angular/platform-browser";
import { ApplicationConfig } from "@angular/core"
import { provideHttpClient } from "@angular/common/http";
import { createCustomElement } from "@angular/elements";
import { WebComponent } from "./app/web-component/web-component";

const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()
  ]
};

(async () => {
  const app = await createApplication(appConfig);

  const mfe_project_list = createCustomElement(WebComponent, { injector: app.injector });

  customElements.define("mfe-project-list", mfe_project_list);
})();