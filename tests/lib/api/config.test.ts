/**
 * Unit Tests for lib/api/config.ts
 *
 * Tests the API route configuration structure and types.
 */

import { routes } from '@/lib/api/config';

describe('API Route Configuration', () => {
  describe('routes structure', () => {
    it('is a non-empty object', () => {
      expect(routes).toBeDefined();
      expect(typeof routes).toBe('object');
    });

    it('has feed routes', () => {
      expect(routes.feed).toBeDefined();
    });

    it('has photos routes', () => {
      expect(routes.photos).toBeDefined();
    });

    it('has professionals routes', () => {
      expect(routes.professionals).toBeDefined();
    });

    it('has contact routes', () => {
      expect(routes.contact).toBeDefined();
    });
  });

  describe('feed routes', () => {
    describe('list', () => {
      it('has correct path', () => {
        expect(routes.feed.list.path).toBe('/api/feed');
      });

      it('has GET method', () => {
        expect(routes.feed.list.method).toBe('GET');
      });

      it('has queryParams defined', () => {
        expect(routes.feed.list.queryParams).toBeDefined();
      });

      it('has response type defined', () => {
        expect(routes.feed.list.response).toBeDefined();
      });
    });
  });

  describe('photos routes', () => {
    describe('get', () => {
      it('has correct path with :id param', () => {
        expect(routes.photos.get.path).toBe('/api/photos/:id');
      });

      it('has GET method', () => {
        expect(routes.photos.get.method).toBe('GET');
      });

      it('has pathParams defined', () => {
        expect(routes.photos.get.pathParams).toBeDefined();
      });

      it('has response type defined', () => {
        expect(routes.photos.get.response).toBeDefined();
      });
    });
  });

  describe('professionals routes', () => {
    describe('get', () => {
      it('has correct path with :id param', () => {
        expect(routes.professionals.get.path).toBe('/api/professionals/:id');
      });

      it('has GET method', () => {
        expect(routes.professionals.get.method).toBe('GET');
      });

      it('has pathParams defined', () => {
        expect(routes.professionals.get.pathParams).toBeDefined();
      });
    });
  });

  describe('contact routes', () => {
    describe('latest', () => {
      it('has correct path', () => {
        expect(routes.contact.latest.path).toBe('/api/contact/latest');
      });

      it('has GET method', () => {
        expect(routes.contact.latest.method).toBe('GET');
      });

      it('has queryParams defined', () => {
        expect(routes.contact.latest.queryParams).toBeDefined();
      });
    });

    describe('conversation', () => {
      it('has correct path with :id param', () => {
        expect(routes.contact.conversation.path).toBe('/api/contact/conversation/:id');
      });

      it('has GET method', () => {
        expect(routes.contact.conversation.method).toBe('GET');
      });
    });

    describe('byProfessional', () => {
      it('has correct path', () => {
        expect(routes.contact.byProfessional.path).toBe('/api/contact/by-professional');
      });

      it('has GET method', () => {
        expect(routes.contact.byProfessional.method).toBe('GET');
      });
    });

    describe('init', () => {
      it('has correct path', () => {
        expect(routes.contact.init.path).toBe('/api/contact/init');
      });

      it('has POST method', () => {
        expect(routes.contact.init.method).toBe('POST');
      });

      it('has body defined', () => {
        expect(routes.contact.init.body).toBeDefined();
      });
    });

    describe('chat', () => {
      it('has correct path', () => {
        expect(routes.contact.chat.path).toBe('/api/contact/chat');
      });

      it('has POST method', () => {
        expect(routes.contact.chat.method).toBe('POST');
      });

      it('has body defined', () => {
        expect(routes.contact.chat.body).toBeDefined();
      });
    });

    describe('markViewed', () => {
      it('has correct path', () => {
        expect(routes.contact.markViewed.path).toBe('/api/contact/mark-viewed');
      });

      it('has POST method', () => {
        expect(routes.contact.markViewed.method).toBe('POST');
      });

      it('has body defined', () => {
        expect(routes.contact.markViewed.body).toBeDefined();
      });
    });
  });

  describe('route consistency', () => {
    it('all GET routes do not have body', () => {
      // Feed routes
      expect('body' in routes.feed.list).toBe(false);
      
      // Photos routes
      expect('body' in routes.photos.get).toBe(false);
      
      // Professionals routes
      expect('body' in routes.professionals.get).toBe(false);
      
      // Contact GET routes
      expect('body' in routes.contact.latest).toBe(false);
      expect('body' in routes.contact.conversation).toBe(false);
      expect('body' in routes.contact.byProfessional).toBe(false);
    });

    it('all POST routes have body', () => {
      expect(routes.contact.init.body).toBeDefined();
      expect(routes.contact.chat.body).toBeDefined();
      expect(routes.contact.markViewed.body).toBeDefined();
    });

    it('all routes have response defined', () => {
      expect(routes.feed.list.response).toBeDefined();
      expect(routes.photos.get.response).toBeDefined();
      expect(routes.professionals.get.response).toBeDefined();
      expect(routes.contact.latest.response).toBeDefined();
      expect(routes.contact.conversation.response).toBeDefined();
      expect(routes.contact.byProfessional.response).toBeDefined();
      expect(routes.contact.init.response).toBeDefined();
      expect(routes.contact.chat.response).toBeDefined();
      expect(routes.contact.markViewed.response).toBeDefined();
    });

    it('paths start with /api/', () => {
      const allPaths = [
        routes.feed.list.path,
        routes.photos.get.path,
        routes.professionals.get.path,
        routes.contact.latest.path,
        routes.contact.conversation.path,
        routes.contact.byProfessional.path,
        routes.contact.init.path,
        routes.contact.chat.path,
        routes.contact.markViewed.path,
      ];

      allPaths.forEach((path) => {
        expect(path).toMatch(/^\/api\//);
      });
    });
  });
});
