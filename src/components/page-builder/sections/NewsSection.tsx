"use client";

import React from "react";
import { useNode } from "@craftjs/core";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { usePosts } from "@/src/lib/hooks/use-posts";
import { Link } from "@/src/i18n/navigation";
import Image from "next/image";

interface NewsSectionProps {
  title?: string;
  showCount?: number;
}

const defaultProps: NewsSectionProps = {
  title: "Latest News",
  showCount: 4,
};

export const NewsSection = (props: NewsSectionProps) => {
  const { title, showCount } = props;

  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { data, isLoading } = usePosts();
  const posts = data?.posts?.slice(0, showCount) || [];

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      className={`py-20 bg-white ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-[#781D32] mx-auto rounded-full" />
        </motion.div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(showCount)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-video rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/articles/${post.slug}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                    {post.featuredImage && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6 space-y-3">
                      {post.categories && post.categories.length > 0 && (
                        <Badge variant="outline" className="text-[#781D32]">
                          {post.categories[0]}
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[#781D32] transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      {post.publishedAt && (
                        <div className="flex items-center text-xs text-gray-500 pt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-[#781D32] hover:text-[#5C1625] font-semibold group"
          >
            View All Articles
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Craft.js Settings Panel
export const NewsSectionSettings = () => {
  const {
    actions: { setProp },
    title,
    showCount,
  } = useNode((node) => ({
    title: node.data?.props?.title,
    showCount: node.data?.props?.showCount,
  }));

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={title}
          onChange={(e) =>
            setProp((props: NewsSectionProps) => (props.title = e.target.value))
          }
        />
      </div>

      <div>
        <Label>Number of Articles to Show</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={showCount}
          onChange={(e) =>
            setProp(
              (props: NewsSectionProps) => (props.showCount = parseInt(e.target.value))
            )
          }
        />
      </div>
    </div>
  );
};

// Craft.js configuration
NewsSection.craft = {
  displayName: "News Section",
  props: defaultProps,
  related: {
    settings: NewsSectionSettings,
  },
};
