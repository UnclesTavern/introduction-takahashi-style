# ASP.NET Core Migration Plan
## Takahashi-Style Introduction Presentation

---

## Overview

This document outlines a comprehensive plan to transform the current static HTML/JavaScript Takahashi-style presentation application into an ASP.NET Core application. The goal is to modernize the infrastructure while preserving the minimalist philosophy and existing functionality.

### Current Architecture
- **Type**: Static HTML/CSS/JavaScript application
- **Deployment**: GitHub Pages (static hosting)
- **Key Components**:
  - `index.html` - Entry point
  - `src/takahashi.js` - Markdown parser and slide renderer (272 lines of vanilla JS)
  - `slides/source.md` - Markdown content for slides
  - `styles/main.css` - Presentation styles
  - External dependencies: highlight.js (CDN)

### Why Transform to ASP.NET Core?

**Potential Benefits:**
1. **Server-side capabilities** - Dynamic content generation, API endpoints, authentication
2. **Modern deployment options** - Azure App Service, Docker, Kubernetes
3. **Enterprise features** - Logging, configuration management, dependency injection
4. **Scalability** - Better control over caching, compression, performance
5. **Content management** - Potential for admin interface, multiple decks, user management
6. **Security** - Built-in security features, CORS, authentication/authorization

**Trade-offs to Consider:**
- Increased complexity vs. current simplicity
- Hosting costs (vs. free GitHub Pages)
- Build/deployment pipeline changes
- Runtime dependencies (.NET runtime vs. static files)

---

## Architecture Decision: Three Recommended Approaches

### Option 1: Hybrid Approach (RECOMMENDED)
**Keep JavaScript frontend, add ASP.NET Core backend**

**Pros:**
- Minimal changes to working JavaScript code
- Preserves client-side interactivity and performance
- Easy migration path
- Can add API features incrementally
- Supports multiple slide decks via API

**Cons:**
- Still requires JavaScript maintenance
- Two technology stacks to maintain

**Best for:** Quick migration with option to add server-side features later

---

### Option 2: Razor Pages with JavaScript
**ASP.NET Core Razor Pages serving the HTML, keep JavaScript for slide logic**

**Pros:**
- Strong server-side rendering
- Can inject configuration/data from server
- Good SEO if needed
- Familiar ASP.NET patterns

**Cons:**
- Similar to Option 1 but more tightly coupled
- JavaScript still needed for interactivity

**Best for:** Teams familiar with Razor, need server-side rendering

---

### Option 3: Blazor WebAssembly (FUTURE-FORWARD)
**Full C# rewrite using Blazor WASM**

**Pros:**
- Single language (C#) for entire application
- Modern SPA framework
- Component-based architecture
- No JavaScript (except interop if needed)
- Progressive Web App (PWA) support

**Cons:**
- Complete rewrite required
- Larger initial download size
- Learning curve for Blazor
- More complex than current solution

**Best for:** Teams committed to .NET ecosystem, want modern SPA without JavaScript

---

## Recommended Implementation: Option 1 (Hybrid Approach)

This plan focuses on **Option 1** as it provides the best balance of minimal changes, modern infrastructure, and future extensibility.

---

## Implementation Steps

### Phase 1: Project Setup & Structure

#### 1.1 Create ASP.NET Core Project
- [ ] Create new ASP.NET Core Web Application (Empty template or Web API)
  - Target: .NET 8.0 (LTS) or .NET 9.0 (latest)
  - Project name: `IntroductionTakahashi` or `TakahashiPresentation`
- [ ] Add required NuGet packages:
  - `Microsoft.AspNetCore.StaticFiles` (for serving static files)
  - `Microsoft.AspNetCore.SpaServices.Extensions` (optional, for SPA integration)
  - `Markdig` (optional, if we want server-side markdown parsing)

#### 1.2 Project Structure
```
TakahashiPresentation/
├── TakahashiPresentation.csproj
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── wwwroot/                          # Static files root
│   ├── index.html                     # Current index.html
│   ├── css/
│   │   └── main.css                   # Renamed from styles/main.css
│   ├── js/
│   │   └── takahashi.js               # Moved from src/takahashi.js
│   ├── slides/
│   │   └── source.md                  # Current slide content
│   └── lib/                           # Optional: local copies of libraries
│       └── highlight/
├── Controllers/                       # Optional API controllers
│   └── SlidesController.cs            # API for slide management
├── Models/                            # Optional data models
│   └── SlideContent.cs
└── Services/                          # Optional services
    └── MarkdownService.cs             # Markdown processing service
```

#### 1.3 Configuration Files
- [ ] Set up `appsettings.json` with:
  - Logging configuration
  - CORS settings (if API needed)
  - Slide file paths
  - Cache settings
- [ ] Create `.gitignore` for .NET projects (bin/, obj/, etc.)
- [ ] Update `README.md` with new build/run instructions

---

### Phase 2: Static File Migration

#### 2.1 Move Static Assets
- [ ] Move `index.html` to `wwwroot/index.html`
- [ ] Move `styles/main.css` to `wwwroot/css/main.css`
- [ ] Move `src/takahashi.js` to `wwwroot/js/takahashi.js`
- [ ] Move `slides/source.md` to `wwwroot/slides/source.md`
- [ ] Update paths in `index.html`:
  ```html
  <!-- Old -->
  <script src="src/takahashi.js"></script>
  <link rel="stylesheet" href="styles/main.css" />
  
  <!-- New -->
  <script src="/js/takahashi.js"></script>
  <link rel="stylesheet" href="/css/main.css" />
  ```
- [ ] Update markdown file path in `takahashi.js`:
  ```javascript
  // Old
  var markdownFile = 'slides/source.md';
  
  // New
  var markdownFile = '/slides/source.md';
  ```

#### 2.2 Configure Static Files Middleware
- [ ] Configure `Program.cs` to serve static files:
  ```csharp
  var builder = WebApplication.CreateBuilder(args);
  var app = builder.Build();
  
  // Enable default files (index.html)
  app.UseDefaultFiles();
  
  // Enable static file serving
  app.UseStaticFiles();
  
  // Fallback to index.html for SPA routing
  app.MapFallbackToFile("index.html");
  
  app.Run();
  ```

---

### Phase 3: Optional API Features

#### 3.1 Slides API Endpoint
Create REST API for slide management (optional, for future extensibility):

- [ ] Create `Models/SlideContent.cs`:
  ```csharp
  public class SlideContent
  {
      public string FileName { get; set; }
      public string Content { get; set; }
      public DateTime LastModified { get; set; }
  }
  ```

- [ ] Create `Controllers/SlidesController.cs`:
  ```csharp
  [ApiController]
  [Route("api/[controller]")]
  public class SlidesController : ControllerBase
  {
      private readonly IWebHostEnvironment _env;
      
      [HttpGet("{fileName}")]
      public async Task<IActionResult> GetSlide(string fileName)
      {
          var filePath = Path.Combine(_env.WebRootPath, "slides", fileName);
          if (!System.IO.File.Exists(filePath))
              return NotFound();
          
          var content = await System.IO.File.ReadAllTextAsync(filePath);
          return Ok(new { content });
      }
      
      [HttpGet]
      public IActionResult ListSlides()
      {
          var slidesPath = Path.Combine(_env.WebRootPath, "slides");
          var files = Directory.GetFiles(slidesPath, "*.md");
          return Ok(files.Select(Path.GetFileName));
      }
  }
  ```

#### 3.2 Server-Side Markdown Parsing (Optional)
- [ ] Install `Markdig` NuGet package
- [ ] Create `Services/MarkdownService.cs` for server-side processing
- [ ] Add endpoint to convert markdown to HTML on server
- [ ] Benefits: Better SEO, faster initial load, server-side caching

---

### Phase 4: Development Environment Setup

#### 4.1 Visual Studio / VS Code Configuration
- [ ] Update `.vscode/launch.json` for ASP.NET Core debugging:
  ```json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "name": ".NET Core Launch (web)",
        "type": "coreclr",
        "request": "launch",
        "preLaunchTask": "build",
        "program": "${workspaceFolder}/bin/Debug/net8.0/TakahashiPresentation.dll",
        "args": [],
        "cwd": "${workspaceFolder}",
        "stopAtEntry": false,
        "serverReadyAction": {
          "action": "openExternally",
          "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
        },
        "env": {
          "ASPNETCORE_ENVIRONMENT": "Development"
        }
      }
    ]
  }
  ```

- [ ] Update `.vscode/tasks.json` for build tasks:
  ```json
  {
    "version": "2.0.0",
    "tasks": [
      {
        "label": "build",
        "command": "dotnet",
        "type": "process",
        "args": [
          "build",
          "${workspaceFolder}/TakahashiPresentation.csproj"
        ]
      },
      {
        "label": "run",
        "command": "dotnet",
        "type": "process",
        "args": [
          "run",
          "--project",
          "${workspaceFolder}/TakahashiPresentation.csproj"
        ]
      }
    ]
  }
  ```

#### 4.2 Local Development
- [ ] Configure hot reload: `dotnet watch run`
- [ ] Set up HTTPS development certificate: `dotnet dev-certs https --trust`
- [ ] Configure default ports in `launchSettings.json`

---

### Phase 5: Deployment Configuration

#### 5.1 Docker Support (Optional but Recommended)
- [ ] Create `Dockerfile`:
  ```dockerfile
  FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
  WORKDIR /app
  EXPOSE 80
  EXPOSE 443
  
  FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
  WORKDIR /src
  COPY ["TakahashiPresentation.csproj", "./"]
  RUN dotnet restore
  COPY . .
  RUN dotnet build -c Release -o /app/build
  
  FROM build AS publish
  RUN dotnet publish -c Release -o /app/publish
  
  FROM base AS final
  WORKDIR /app
  COPY --from=publish /app/publish .
  ENTRYPOINT ["dotnet", "TakahashiPresentation.dll"]
  ```

- [ ] Create `.dockerignore`:
  ```
  **/.git
  **/bin
  **/obj
  **/node_modules
  ```

#### 5.2 Azure Deployment
- [ ] Update `.github/workflows/` for Azure deployment:
  - Replace static site deployment with Azure App Service deployment
  - Add build step: `dotnet publish -c Release -o ./publish`
  - Add Azure Web App deployment action
  - Configure connection string in Azure App Service settings

- [ ] Example GitHub Actions workflow:
  ```yaml
  name: Deploy to Azure
  on:
    push:
      branches: [ main ]
  
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      
      - name: Restore dependencies
        run: dotnet restore
      
      - name: Build
        run: dotnet build --configuration Release --no-restore
      
      - name: Publish
        run: dotnet publish -c Release -o ./publish
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'takahashi-presentation'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish
  ```

#### 5.3 Alternative Deployments
- [ ] **Azure Static Web Apps**: If keeping pure static approach
- [ ] **Azure Container Instances**: For Docker deployment
- [ ] **IIS**: Traditional Windows hosting
- [ ] **Linux VM with Nginx**: Reverse proxy setup

---

### Phase 6: Enhancement Opportunities

#### 6.1 Multiple Slide Decks
- [ ] Support multiple markdown files
- [ ] Add deck selection UI
- [ ] Store deck metadata (title, author, date)

#### 6.2 Admin Interface (Optional)
- [ ] Add Razor Pages for slide management
- [ ] Markdown editor with live preview
- [ ] Authentication using Azure AD or Identity

#### 6.3 Analytics & Tracking
- [ ] Add Application Insights
- [ ] Track slide views, navigation patterns
- [ ] Performance monitoring

#### 6.4 PWA Features
- [ ] Add service worker for offline support
- [ ] Add manifest.json for installability
- [ ] Cache slides for offline viewing

---

## Testing

### Unit Tests
- [ ] Create test project: `TakahashiPresentation.Tests`
- [ ] Add test framework: xUnit, NUnit, or MSTest
- [ ] Test API controllers (if implemented):
  ```csharp
  [Fact]
  public async Task GetSlide_ReturnsSlideContent()
  {
      // Arrange
      var controller = new SlidesController(_mockEnv);
      
      // Act
      var result = await controller.GetSlide("source.md");
      
      // Assert
      var okResult = Assert.IsType<OkObjectResult>(result);
      Assert.NotNull(okResult.Value);
  }
  ```

### Integration Tests
- [ ] Test static file serving
- [ ] Test default file routing (index.html)
- [ ] Test API endpoints with in-memory database
- [ ] Use `WebApplicationFactory<Program>` for integration tests

### Frontend Tests (Existing JavaScript)
- [ ] Keep existing manual testing approach (if no tests exist)
- [ ] Optional: Add Jest/Mocha for JavaScript unit tests
- [ ] Optional: Add Playwright/Cypress for E2E tests

### Performance Tests
- [ ] Benchmark static file serving performance
- [ ] Load testing with tools like k6 or Apache Bench
- [ ] Ensure response times < 100ms for static files

### Manual Testing Checklist
- [ ] Verify index.html loads at root path
- [ ] Verify slide navigation (keyboard arrows)
- [ ] Verify touch navigation works
- [ ] Verify code syntax highlighting works
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test responsive design on mobile devices
- [ ] Verify all styles load correctly
- [ ] Test with different slide markdown content

---

## Migration Checklist

### Prerequisites
- [ ] Install .NET 8.0 SDK or later
- [ ] Install Visual Studio 2022 / VS Code with C# extensions
- [ ] Review current functionality to ensure nothing is lost

### Core Migration
- [ ] Create ASP.NET Core project structure
- [ ] Move static files to wwwroot
- [ ] Update file paths in HTML/JS
- [ ] Configure Program.cs for static file serving
- [ ] Test local development environment

### Optional Enhancements
- [ ] Implement Slides API
- [ ] Add Docker support
- [ ] Set up CI/CD pipeline
- [ ] Configure Azure deployment
- [ ] Add monitoring/logging

### Documentation
- [ ] Update README.md with new instructions
- [ ] Document API endpoints (if added)
- [ ] Create deployment guide
- [ ] Update architecture diagrams

### Cleanup
- [ ] Remove old GitHub Pages workflow (or keep as backup)
- [ ] Archive old deployment documentation
- [ ] Update repository description
- [ ] Tag old version before migration

---

## Estimated Timeline

- **Phase 1 (Project Setup)**: 2-4 hours
- **Phase 2 (Static File Migration)**: 1-2 hours
- **Phase 3 (API Features)**: 4-8 hours (optional)
- **Phase 4 (Dev Environment)**: 1-2 hours
- **Phase 5 (Deployment)**: 3-6 hours
- **Phase 6 (Enhancements)**: 8-16 hours (optional)
- **Testing**: 2-4 hours

**Total (Core Migration)**: 7-14 hours
**Total (With Enhancements)**: 20-40 hours

---

## Risks & Mitigations

### Risk 1: Breaking Existing Functionality
**Mitigation**: 
- Keep original branch as backup
- Test thoroughly at each step
- Use feature flags for new features

### Risk 2: Increased Hosting Costs
**Mitigation**: 
- Use Azure Free Tier initially
- Consider Azure Static Web Apps (free tier available)
- Compare costs vs. GitHub Pages

### Risk 3: Deployment Complexity
**Mitigation**: 
- Start with simplest deployment (Azure App Service)
- Document deployment process
- Create rollback plan

### Risk 4: JavaScript Path Issues
**Mitigation**: 
- Use root-relative paths (/js/file.js)
- Test with different base URLs
- Configure proper MIME types

---

## Success Criteria

1. ✅ Application runs locally with `dotnet run`
2. ✅ All existing functionality preserved (slide navigation, syntax highlighting)
3. ✅ Static files served correctly
4. ✅ Deployed successfully to target environment
5. ✅ Performance equal to or better than current implementation
6. ✅ Documentation updated
7. ✅ CI/CD pipeline functional

---

## Alternatives Considered

### Alternative 1: Keep Static, Just Add API
- Minimal ASP.NET Core API alongside static GitHub Pages
- API hosted separately for future features
- **Verdict**: Adds complexity without clear benefit for current needs

### Alternative 2: Full Blazor Server
- Real-time server rendering with SignalR
- No JavaScript needed
- **Verdict**: Overkill for presentation slides, adds latency

### Alternative 3: Next.js or Modern JS Framework
- Not .NET, but modern alternative
- **Verdict**: Doesn't meet requirement to use ASP.NET Core

---

## Questions to Resolve Before Starting

1. **Which architecture option do you prefer?** (Hybrid, Razor Pages, or Blazor)
2. **Do you need API features immediately?** (Or just infrastructure first?)
3. **What's your deployment target?** (Azure, Docker, IIS, other)
4. **Do you want multiple slide deck support?** (Or single deck is sufficient)
5. **Authentication needed?** (Public access or restricted)
6. **Budget for hosting?** (Free tier, or production-ready)

---

## Next Steps

Once architecture is confirmed:
1. Create new branch: `feature/aspnet-core-migration`
2. Initialize ASP.NET Core project
3. Migrate static files
4. Test locally
5. Configure deployment
6. Update documentation
7. Create pull request with migration

---

## References

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core)
- [Static Files in ASP.NET Core](https://docs.microsoft.com/aspnet/core/fundamentals/static-files)
- [Deploy ASP.NET Core to Azure](https://docs.microsoft.com/azure/app-service/quickstart-dotnetcore)
- [Blazor Documentation](https://docs.microsoft.com/aspnet/core/blazor)
- [Docker for .NET](https://docs.microsoft.com/dotnet/core/docker/introduction)

---

*This plan is a living document. Adjust based on specific requirements and constraints.*
